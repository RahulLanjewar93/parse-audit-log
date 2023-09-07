export declare type AuditLoggerOptions = {
    prefix?: string;
    postfix?: string;
    parseClient?: any;
    allowClientClassCreation: boolean;
    useMasterKey?: boolean;
    captureState: boolean;
    auditClasses?: {
        save?: string[];
        find?: string[];
        delete?: string[];
    };
};
