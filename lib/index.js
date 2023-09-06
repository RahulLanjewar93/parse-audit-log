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
const defaultClassLevelPermissions = {
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
const defaultFields = {
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
    getAuditSchemas(classNames) {
        const result = classNames.map(className => {
            return {
                className: `${this.options.prefix ?? ''}${className}${this.options.postfix ?? ''}`,
                fields: defaultFields,
                classLevelPermissions: defaultClassLevelPermissions,
            };
        });
        return result;
    }
    async auditSaveRequest(req, auditObjectOptions) {
        const auditClassName = `${this.options.prefix ?? ''}${req.object.className}${this.options.postfix ?? ''}`;
        const action = req.original ? 'UPDATE' : 'CREATE';
        const auditObject = new this.options.parseClient.Object(auditClassName);
        if (auditObjectOptions?.extraData) {
            auditObjectOptions.extraData.forEach((extraData) => {
                auditObject.set(extraData.fieldName, extraData.fieldValue);
            });
        }
        auditObject.set('targetId', req.object.id);
        auditObject.set('targetAction', action);
        auditObject.set('user', req.user);
        auditObject.set('master', req.master);
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