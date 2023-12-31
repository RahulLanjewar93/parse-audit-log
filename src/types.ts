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
     * Parse classes to audit on save.
     * If this option is provided, only the classes provided in this array will be audited.
    */
    onSave?: string[],
    /**
     * Parse classes to audit on find.
     * If this option is provided, only the classes provided in this array will be audited.
    */
    onFind?: string[],
    /**
     * Parse classes to audit on delete.
     * If this option is provided, only the classes provided in this array will be audited.
    */
    onDelete?: string[],
    /**
     * Instead of creating a new class for each audit, use a single class.
     * 
     * When using single class, the subject is a embedded in subject.pointer
     * @default false
     */
    useSingleClass?: boolean,
    /**
     * When use single class is enabled, you can provide the name of the class you want to set.
     * @default AUDIT
     */
    singleClassName?: string,
}

export type AuditOptions = {
    /**
     * Store previous and current values in audit objects.
     * The value is stored in `meta.previous` and `meta.current`
     * @default false 
     */
    storeChanges?: boolean
}