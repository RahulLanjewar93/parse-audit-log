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
     * Use masterKey while creating audit objects.
     * 
     * @default false
     */
    useMasterKey?: boolean,
    /**
     * Parse classes to audit.
     * 
    */
    auditClasses?: {
        save?: string[],
        find?: string[],
        delete?: string[],
    };
}