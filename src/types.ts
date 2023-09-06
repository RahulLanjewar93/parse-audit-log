export type AuditLoggerOptions = {
    /**
     * The prefix to add for the audit classes. 
     * 
     * @default AUDIT_
     * @example
     * ```ts
     * const Audit = new AuditLogger({
     *  prefix: 'AUD_'
     * })
     * ```
     */
    prefix?: string,
    /**
     * The postfix to add for the audit classes. 
     * 
     * @example
     * ```ts
     * const Audit = new AuditLogger({
     *  postfix: '_LOG'
     * })
     * ```
     */
    postfix?: string,
    /**
     * The parse sdk to use. 
     * Default to the global Parse SDK.
     * 
     * @default Parse
     */
    parseClient?: any,
    /**
     * This options tells the audit logger if `allowClientClassCreation` is true or false.
     * If it's set to true, then we need to register the schemas with the parse server, or use masterKey.
     * 
     * @default true
     */
    allowClientClassCreation: boolean,
    /**
     * Use masterKey while creating audit objects.
     * 
     * @default false
     */
    useMasterKey?: boolean,
    /**
     * This options tells the audit logger wether to log original and updated state.
     * 
     * @default false
     */
    captureState: boolean,
    /**
     * Parse schemas to apply to the audit objects.
     * 
    */
    schemas?: {
        save?: any[],
        find?: any[],
        delete?: any[],
    };
}

export type AuditObjectSaveOptions = {
    // Extra data to add to the audit object, Will be added as a separate column.
    extraData?: {
        fieldName: string,
        fieldValue: any,
    }[];
}