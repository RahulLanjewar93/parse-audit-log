import { JSONSchema } from "./server";
import { AuditLoggerOptions, AuditObjectSaveOptions } from "./types";
export default class AuditLogger {
    private options;
    constructor(options: AuditLoggerOptions);
    private validateOptions;
    getAuditSchemas(classNames: string[]): JSONSchema[];
    auditSaveRequest(req: any, auditObjectOptions?: AuditObjectSaveOptions): Promise<void>;
    auditDeleteRequest(): Promise<void>;
    auditFindRequest(): Promise<void>;
}
