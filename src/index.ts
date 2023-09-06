/// <reference types="parse" />
import { JSONSchema } from "./server";
import { AuditLoggerOptions, AuditObjectSaveOptions } from "./types";

const defaultOptions: AuditLoggerOptions = {
  prefix: "AUDIT_",
  postfix: undefined,
  parseClient: Parse,
  allowClientClassCreation: true,
  useMasterKey: false,
  captureState: false,
}

export default class AuditLogger {
  private options: AuditLoggerOptions;

  constructor(options: AuditLoggerOptions) {
    this.options = Object.assign({}, options, defaultOptions);
    this.validateOptions();
  }

  private validateOptions() {
    // If allowClientClassCreation is not false, then either masterKey or schemas must be provided. 
    if (!this.options.allowClientClassCreation && !this.options.useMasterKey) {
      throw new Error("When allowClientClassCreation is false, either masterKey must be provided.");
    }
  }

  getAuditClasses(classNames: string[]): JSONSchema[] {
    const result: JSONSchema[] = classNames.map(className => {
      return {
        className: `${this.options.prefix ?? ''}${className}${this.options.postfix ?? ''}`,
        fields: {
          user: {
            type: 'Pointer',
            targetClass: '_User',
          },
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
          master: {
            type: 'Boolean'
          }
        },
      }
    })

    return result;
  }

  async auditSaveRequest(req: any, auditObjectOptions?: AuditObjectSaveOptions) {
    const auditClassName = `${this.options.prefix ?? ''}${req.object.className}${this.options.postfix ?? ''}`;
    const action = req.original ? 'UPDATE' : 'CREATE';
    const auditObject = new this.options.parseClient.Object(auditClassName);

    // If extraData is provided, add that.
    if (auditObjectOptions?.extraData) {
      auditObjectOptions.extraData.forEach((extraData) => {
        auditObject.set(extraData.fieldName, extraData.fieldValue);
      })
    }

    auditObject.set('targetId', req.object.id);
    auditObject.set('targetAction', action);
    auditObject.set('user', req.user);
    auditObject.set('master', req.master);
    auditObject.set('previousState', req.original.attributes);
    auditObject.set('currentState', req.object.attributes);


    // Save the audit object.
    await auditObject.save(null, { useMasterKey: this.options.useMasterKey });
  }

  async auditDeleteRequest() {

  }

  async auditFindRequest() {

  }
}