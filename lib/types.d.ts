export declare type AuditLoggerOptions = {
    prefix?: string;
    postfix?: string;
    parseClient?: any;
    allowClientClassCreation: boolean;
    useMasterKey?: boolean;
    captureState: boolean;
    schemas?: {
        save?: any[];
        find?: any[];
        delete?: any[];
    };
};
export declare type AuditObjectSaveOptions = {
    extraData?: {
        fieldName: string;
        fieldValue: any;
    }[];
};
