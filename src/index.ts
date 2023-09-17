import { JSONSchema } from "./index.d";
import { AuditLoggerOptions } from "./types";

const defaultOptions: AuditLoggerOptions = {
  prefix: "AUDIT_",
  parseClient: Parse,
}

const defaultClassLevelPermissions: JSONSchema['classLevelPermissions'] = {
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
};

const defaultFields: JSONSchema['fields'] = {
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
  }
}

function getDefaultFields(className: string): JSONSchema['fields'] {
  return {
    ...defaultFields,
    subject: {
      type: 'Pointer',
      targetClass: className
    }
  }
}

export default class AuditLogger {
  private static initialized: boolean;
  private static options: AuditLoggerOptions;

  private static validateState() {
    if (!this.initialized) {
      throw new Error('AuditLogger is not initialized');
    }
  }

  public static initialize(options?: AuditLoggerOptions) {
    this.options = Object.assign({}, defaultOptions, options);
    this.initialized = true;
  }

  public static schemas(classNames: string[]): JSONSchema[] {
    this.validateState();

    const result: JSONSchema[] = classNames.map(className => {
      return {
        className: `${this.options.prefix ?? ''}${className}${this.options.postfix ?? ''}`,
        fields: getDefaultFields(className),
        classLevelPermissions: defaultClassLevelPermissions,
      }
    })

    return result;
  }

  public static async audit(
    req: Parse.Cloud.BeforeFindRequest
      | Parse.Cloud.AfterFindRequest
      | Parse.Cloud.BeforeSaveRequest
      | Parse.Cloud.AfterSaveRequest
      | Parse.Cloud.BeforeDeleteRequest
      | Parse.Cloud.AfterDeleteRequest
  ) {
    this.validateState();
    const auditOptions: Record<any, any> = {}

    // Handle find requests
    if (req.triggerName === 'beforeFind' || req.triggerName === 'afterFind') {
      // Handle beforeFind requests.
      if (req.triggerName === 'beforeFind') {
        const r = (req as Parse.Cloud.BeforeFindRequest);
        auditOptions.action = r.isGet ? 'GET' : 'FIND';
        auditOptions.class = r.query.className;

        // If req is get and its not a or query, set the subject
        const queryJSON = r.query.toJSON();
        if (r.isGet && !!queryJSON.$or) {
          auditOptions.subject = new Parse.Object(r.query.className, {
            objectId: r.query.toJSON().where.objectId
          });
        }
      }

      // Handle afterFind requests
      if (req.triggerName === 'afterFind') {
        const r = (req as Parse.Cloud.AfterFindRequest);
        const objectCLassName = r.objects[0]?.className;
        auditOptions.class = objectCLassName;
        auditOptions.action = 'FIND';
      }


      /**
      * If onFind classes are provided,
      * and if current class does not exists in the provided classes, then return.
      */
      if (this.options.onFind && !this.options.onFind.includes(auditOptions.class)) {
        return;
      }

    }

    // Handle save requests
    if (req.triggerName === 'beforeSave' || req.triggerName === 'afterSave') {
      const r = (req as Parse.Cloud.AfterSaveRequest);
      const objectCLassName = r.object.className;
      auditOptions.subject = r.object;
      auditOptions.class = objectCLassName;
      auditOptions.action = r.original ? 'UPDATE' : 'CREATE';

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
      auditOptions.subject = r.object.toPointer();
      auditOptions.class = objectCLassName;
      auditOptions.action = 'DELETE';

      /**
      * If onDelete classes are provided,
      * and if current class does not exists in the provided classes, then return.
      */
      if (this.options.onSave && !this.options.onSave.includes(req.object.className)) {
        return;
      }
    }

    auditOptions.master = req.master;
    auditOptions.user = req.user;


    //Validate auditOptions
    if (!auditOptions.class) {
      return;
    }

    const auditObject = new Parse.Object(`${this.options.prefix ?? ''}${auditOptions.class}${this.options.postfix ?? ''}`);
    await auditObject.save(auditOptions, { useMasterKey: this.options.useMasterKey, cascadeSave: false });
  }
}