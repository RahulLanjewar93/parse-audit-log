import { JSONSchema } from "./index.d";
import { AuditLoggerOptions } from "./types";
export default class AuditLogger {
    private options;
    constructor(options: AuditLoggerOptions);
    /**
     * Validates the options for the function.
     *
     * @return {void} - Does not return a value.
     */
    private validateOptions;
    /**
     * Generates an array of audit schemas based on the provided class names.
     *
     * @param {string[]} classNames - An array of class names to generate audit schemas for.
     * @return {JSONSchema[]} - An array of JSON schemas representing the audit schemas.
     */
    getAuditSchemas(classNames: string[]): JSONSchema[];
    auditFindRequest(req: Parse.Cloud.AfterFindRequest): Promise<void>;
    /**
     * Async function that performs an audit save request.
     *
     * @param {Parse.Cloud.AfterSaveRequest} req - The request object for the save operation.
     * @return {Promise<void>} A promise that resolves when the audit save request is complete.
     */
    auditSaveRequest(req: Parse.Cloud.AfterSaveRequest): Promise<void>;
    auditDeleteRequest(req: Parse.Cloud.AfterDeleteRequest): Promise<void>;
}
