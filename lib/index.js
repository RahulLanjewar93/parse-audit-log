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
    master: {
        type: 'Boolean'
    },
    meta: {
        type: 'Object'
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
    query: {
        type: 'Object'
    },
    queryResult: {
        type: 'Array'
    }
};
class AuditLogger {
    constructor(options) {
        this.options = Object.assign({}, options, defaultOptions);
        this.validateOptions();
    }
    validateOptions() {
        if (!this.options.allowClientClassCreation) {
            console.warn('Allow client creation is false, please make sure to register audit schemas with your parse server.');
        }
        if (this.options.parseClient === undefined) {
            throw new Error("Parse is not initialized. Please initialize Parse or provide a parse sdk");
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
    async auditFindRequest(req) {
        const objectClassName = req.query.className;
        if (this.options.auditClasses?.find && !this.options.auditClasses?.find.includes(objectClassName)) {
            return;
        }
        const auditClassName = `${this.options.prefix ?? ''}${objectClassName}${this.options.postfix ?? ''}`;
        const auditAction = req.query.isGet ? 'GET' : 'FIND';
        const auditObject = new this.options.parseClient.Object(auditClassName);
        auditObject.set('targetAction', auditAction);
        auditObject.set('user', req.user);
        auditObject.set('master', req.master);
        auditObject.set('query', req.query);
        auditObject.set('queryResult', req.objects);
        await auditObject.save(null, { useMasterKey: this.options.useMasterKey });
    }
    async auditSaveRequest(req) {
        const objectClassName = req.object.className;
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
        await auditObject.save(null, { useMasterKey: this.options.useMasterKey });
    }
    async auditDeleteRequest(req) {
        const objectClassName = req.object.className;
        if (this.options.auditClasses?.save && !this.options.auditClasses?.save.includes(objectClassName)) {
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
        await auditObject.save(null, { useMasterKey: this.options.useMasterKey });
    }
}
exports.default = AuditLogger;
//# sourceMappingURL=index.js.map