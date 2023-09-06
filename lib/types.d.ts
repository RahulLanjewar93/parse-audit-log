export declare type AuditLoggerOptions = {
    prefix?: string;
    postfix?: string;
    parseClient?: any;
    allowClientClassCreation: boolean;
    useMasterKey?: boolean;
    captureState: boolean;
};
export declare type AuditObjectSaveOptions = {
    extraData?: {
        fieldName: string;
        fieldValue: any;
    }[];
};
