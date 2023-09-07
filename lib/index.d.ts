import { JSONSchema } from "./index.d";
import { AuditLoggerOptions } from "./types";
export default class AuditLogger {
    private options;
    constructor(options: AuditLoggerOptions);
    private validateOptions;
    getAuditSchemas(classNames: string[]): JSONSchema[];
    auditFindRequest(req: Parse.Cloud.AfterFindRequest): Promise<void>;
    auditSaveRequest(req: Parse.Cloud.AfterSaveRequest): Promise<void>;
    auditDeleteRequest(req: Parse.Cloud.AfterDeleteRequest): Promise<void>;
}
