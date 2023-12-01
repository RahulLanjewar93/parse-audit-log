import { JSONSchema } from "./index.d";
import { AuditLoggerOptions, AuditOptions } from "./types";

export default class AuditLogger {
  private static defaultOptions: AuditLoggerOptions = {
    prefix: "AUDIT_",
    parseClient: Parse,
    useSingleClass: false,
    singleClassName: 'AUDIT',
  }

  private static defaultClassLevelPermissions: JSONSchema['classLevelPermissions'] = {
    get: {
      '*': true,
    },
    find: {
      '*': true,
    },
    create: {
      '*': true,
    },
    update: {
      '*': true,
    },
    delete: {
      '*': true,
    },
    protectedFields: {},
  }

  private static defaultFields: JSONSchema['fields'] = {
    user: {
      type: 'Pointer',
      targetClass: '_User',
    },
    master: {
      type: 'Boolean'
    },
    action: {
      type: 'String',
    },
    class: {
      type: 'String',
    },
    meta: {
      type: 'Object',
    }
  }

  private static initialized: boolean;
  private static options: AuditLoggerOptions;

  private static validateState() {
    if (!this.initialized) {
      throw new Error('AuditLogger is not initialized');
    }
  }

  public static validateOptions(options: AuditLoggerOptions) {
    if (options.useSingleClass === true && options.singleClassName?.length === 0) {
      throw new Error('Empty string not allowed as singleClassName. Set it to a non-empty string');
    }
  }

  public static initialize(options?: AuditLoggerOptions) {
    this.options = Object.assign({}, this.defaultOptions, options);
    this.validateOptions(this.options);
    this.initialized = true;
  }

  private static getDefaultFields(className: string): JSONSchema['fields'] {
    return {
      ...this.defaultFields,
      subject: this.options.useSingleClass ? {
        type: 'Object',
      } : {
        type: 'Pointer',
        targetClass: className
      }
    }
  }

  public static schemas(classNames?: string[]): JSONSchema[] {
    this.validateState();

    const result: JSONSchema[] = [];

    if (classNames?.length === 0 && !this.options.useSingleClass) {
      throw new Error('classNames is required.');
    }

    if (classNames?.length && this.options.useSingleClass) {
      throw new Error('when useSingleClass is set to true, classNames is not required.');
    }

    if (this.options.useSingleClass) {
      result.push({
        className: this.options.singleClassName as string,
        fields: this.getDefaultFields(this.options.singleClassName as string),
        classLevelPermissions: this.defaultClassLevelPermissions,
      })
    } else {
      result.push(...classNames!.map(className => {
        return {
          className: `${this.options.prefix ?? ''}${className}${this.options.postfix ?? ''}`,
          fields: this.getDefaultFields(className),
          classLevelPermissions: this.defaultClassLevelPermissions,
        }
      }));
    }

    return result;
  }

  public static async audit(
    req: Parse.Cloud.BeforeFindRequest
      | Parse.Cloud.AfterFindRequest
      | Parse.Cloud.BeforeSaveRequest
      | Parse.Cloud.AfterSaveRequest
      | Parse.Cloud.BeforeDeleteRequest
      | Parse.Cloud.AfterDeleteRequest,
    options?: AuditOptions
  ) {
    this.validateState();
    const auditData: Record<any, any> = {}

    // Handle find requests
    if (req.triggerName === 'beforeFind' || req.triggerName === 'afterFind') {
      // Handle beforeFind requests.
      if (req.triggerName === 'beforeFind') {
        const r = (req as Parse.Cloud.BeforeFindRequest);
        auditData.action = r.isGet ? 'GET' : 'FIND';
        auditData.class = r.query.className;

        const queryJSON = r.query.toJSON();
        // If req is get and its not a or query, set the subject
        if (r.isGet && queryJSON?.where?.objectId) {
          const subject = new Parse.Object(r.query.className, {
            objectId: r.query.toJSON().where.objectId
          });

          //  if we are not logging everything in a single class, subject will be a nested key.
          auditData.subject = this.options.useSingleClass ? { pointer: subject } : subject
        }
      }

      // Handle afterFind requests
      if (req.triggerName === 'afterFind') {
        const r = (req as Parse.Cloud.AfterFindRequest);
        const objectCLassName = r.objects[0]?.className;
        auditData.class = objectCLassName;
        auditData.action = 'FIND';
      }

      /**
      * If onFind classes are provided,
      * and if current class does not exists in the provided classes, then return.
      */
      if (this.options.onFind && !this.options.onFind.includes(auditData.class)) {
        return;
      }

    }

    // Handle save requests
    if (req.triggerName === 'beforeSave' || req.triggerName === 'afterSave') {
      const r = (req as Parse.Cloud.AfterSaveRequest);
      const objectCLassName = r.object.className;

      auditData.class = objectCLassName;
      auditData.action = r.original ? 'UPDATE' : 'CREATE';


      const subject = r.object.toPointer();
      //  if we are not logging everything in a single class, subject will be a nested key.
      auditData.subject = this.options.useSingleClass ? { pointer: subject } : subject

      // If storeChanges is set to true, then save previous and current value
      if (options?.storeChanges) {
        // Only available in update requests
        auditData.meta = {
          previous: req.original?.toJSON(),
          current: req.object.toJSON()
        }
      }

      /**
      * If onSave classes are provided,
      * and if current class does not exists in the provided classes, then return.
      */
      if (this.options.onSave && !this.options.onSave.includes(req.object.className)) {
        return;
      }
    }

    // Handle delete requests
    if (req.triggerName === 'beforeDelete' || req.triggerName === 'afterDelete') {
      const r = (req as Parse.Cloud.AfterDeleteRequest);
      const objectCLassName = r.object.className;
      auditData.class = objectCLassName;
      auditData.action = 'DELETE';

      const subject = r.object.toPointer();
      //  if we are not logging everything in a single class, subject will be a nested key.
      auditData.subject = this.options.useSingleClass ? { pointer: subject } : subject;
      /**
      * If onDelete classes are provided,
      * and if current class does not exists in the provided classes, then return.
      */
      if (this.options.onSave && !this.options.onSave.includes(req.object.className)) {
        return;
      }
    }

    auditData.master = req.master;
    auditData.user = req.user;


    //Validate auditOptions
    if (!auditData.class) {
      return;
    }

    const parsedClassName = `${this.options.prefix ?? ''}${auditData.class}${this.options.postfix ?? ''}`;

    const auditObject = new Parse.Object(
      this.options.useSingleClass
        ? this.options.singleClassName
        : parsedClassName
    );
    await auditObject.save(auditData, { useMasterKey: this.options.useMasterKey, cascadeSave: false });
  }
}