"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultOptions = {
    prefix: "AUDIT_",
    postfix: undefined,
    parseClient: Parse,
    allowClientClassCreation: true,
    useMasterKey: false,
    captureState: false,
};
class AuditLogger {
    constructor(options) {
        this.options = Object.assign({}, options, defaultOptions);
        this.validateOptions();
    }
    validateOptions() {
        if (!this.options.allowClientClassCreation && !this.options.useMasterKey) {
            throw new Error("When allowClientClassCreation is false, either masterKey must be provided.");
        }
    }
    async auditSaveRequest(req, auditObjectOptions) {
        const auditClassName = `${this.options.prefix ?? ''}${req.object.className}${this.options.postfix ?? ''}`;
        const action = req.original ? 'UPDATE' : 'CREATE';
        const auditObject = new this.options.parseClient.Object(auditClassName);
        const user = req.user
            ? req.user.toPointer()
            : (req.master
                ? 'master'
                : null);
        if (auditObjectOptions?.extraData) {
            auditObjectOptions.extraData.forEach((extraData) => {
                auditObject.set(extraData.fieldName, extraData.fieldValue);
            });
        }
        auditObject.set('user', user);
        auditObject.set('targetId', req.object.id);
        auditObject.set('targetAction', action);
        auditObject.set('previousState', req.original.attributes);
        auditObject.set('currentState', req.object.attributes);
        await auditObject.save(null, { useMasterKey: this.options.useMasterKey });
    }
    async auditDeleteRequest() {
    }
    async auditFindRequest() {
    }
}
exports.default = AuditLogger;
//# sourceMappingURL=index.js.map