import { JSONSchema } from "./index.d";
import { AuditLoggerOptions } from "./types";

const defaultOptions: AuditLoggerOptions = {
  prefix: "AUDIT_",
  postfix: undefined,
  parseClient: Parse,
  useMasterKey: false,
  auditClasses: { find: [], save: [], delete: [] }
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
  // Common
  user: {
    type: 'Pointer',
    targetClass: '_User',
  },
  master: {
    type: 'Boolean'
  },
  meta: {
    type: 'Object'
  },
  // Save/Delete
  targetId: {
    type: 'String',
  },
  targetAction: {
    type: 'String',
  },
  previousState: {
    type: 'Object'
  },
  currentState: {
    type: 'Object'
  },
  // Find
  query: {
    type: 'Object'
  },
  queryResult: {
    type: 'Array'
  }
}

export default class AuditLogger {
  private options: AuditLoggerOptions;

  constructor(options: AuditLoggerOptions) {
    this.options = Object.assign({}, defaultOptions, options);
    this.validateOptions();
  }

  /**
   * Validates the options for the function.
   *
   * @return {void} - Does not return a value.
   */
  private validateOptions() {
    // If allowClientClassCreation is false, inform user to register audit schemas. 
    if (!this.options.allowClientClassCreation) {
      console.warn('Allow client creation is false, please make sure to register audit schemas with your parse server.')
    }

    if (this.options.parseClient === undefined) {
      throw new Error("Parse is not initialized. Please initialize Parse or provide a parse sdk")
    }
  }

  /**
   * Generates an array of audit schemas based on the provided class names.
   *
   * @param {string[]} classNames - An array of class names to generate audit schemas for.
   * @return {JSONSchema[]} - An array of JSON schemas representing the audit schemas.
   */
  getAuditSchemas(classNames: string[]): JSONSchema[] {
    const result: JSONSchema[] = classNames.map(className => {
      return {
        className: `${this.options.prefix ?? ''}${className}${this.options.postfix ?? ''}`,
        fields: defaultFields,
        classLevelPermissions: defaultClassLevelPermissions,
      }
    })

    return result;
  }


  async auditFindRequest(req: Parse.Cloud.AfterFindRequest) {
    // @ts-ignore-next-line;
    // Object's className
    const objectClassName = req.query.className;

    // If the current class is not registered as audit class, do nothing.
    if (this.options.auditClasses?.find && !this.options.auditClasses?.find.includes(objectClassName)) {
      return;
    }

    const auditClassName = `${this.options.prefix ?? ''}${objectClassName}${this.options.postfix ?? ''}`;
    // @ts-ignore-next-line;
    const auditAction = req.query.isGet ? 'GET' : 'FIND';
    const auditObject = new this.options.parseClient.Object(auditClassName);

    auditObject.set('targetAction', auditAction);
    auditObject.set('user', req.user);
    auditObject.set('master', req.master);
    //@ts-ignore-next-line
    auditObject.set('query', req.query);
    auditObject.set('queryResult', req.objects.map(o => o.attributes));

    // Save the audit object.
    try {
      await auditObject.save(null, { useMasterKey: this.options.useMasterKey });
    } catch (err) {
      console.warn(err)
    }
  }

  /**
   * Async function that performs an audit save request.
   *
   * @param {Parse.Cloud.AfterSaveRequest} req - The request object for the save operation.
   * @return {Promise<void>} A promise that resolves when the audit save request is complete.
   */
  async auditSaveRequest(req: Parse.Cloud.AfterSaveRequest) {
    // Object's className
    const objectClassName = req.object.className;

    // If the current class is not registered as audit class, do nothing.
    if (this.options.auditClasses?.save && !this.options.auditClasses?.save.includes(objectClassName)) {
      return;
    }

    const auditClassName = `${this.options.prefix ?? ''}${objectClassName}${this.options.postfix ?? ''}`;
    const auditAction = req.original ? 'UPDATE' : 'CREATE';
    const auditObject = new this.options.parseClient.Object(auditClassName);

    auditObject.set('targetId', req.object.id);
    auditObject.set('targetAction', auditAction);
    auditObject.set('user', req.user);
    auditObject.set('master', req.master);
    auditObject.set('previousState', req.original?.attributes);
    auditObject.set('currentState', req.object.attributes);

    // Save the audit object.
    await auditObject.save(null, { useMasterKey: this.options.useMasterKey });
  }

  async auditDeleteRequest(req: Parse.Cloud.AfterDeleteRequest) {
    // Object's className
    const objectClassName = req.object.className;

    // If the current class is not registered as audit class, do nothing.
    if (this.options.auditClasses?.delete && !this.options.auditClasses?.delete.includes(objectClassName)) {
      return;
    }

    const auditClassName = `${this.options.prefix ?? ''}${objectClassName}${this.options.postfix ?? ''}`;
    const auditAction = 'DELETE';
    const auditObject = new this.options.parseClient.Object(auditClassName);

    auditObject.set('targetId', req.object.id);
    auditObject.set('targetAction', auditAction);
    auditObject.set('user', req.user);
    auditObject.set('master', req.master);
    auditObject.set('currentState', req.object.attributes);

    // Save the audit object.
    await auditObject.save(null, { useMasterKey: this.options.useMasterKey });
  }
}