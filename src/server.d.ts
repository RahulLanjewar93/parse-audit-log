export interface SchemaOptions {
    definitions: JSONSchema[];
    strict: ?boolean;
    deleteExtraFields: ?boolean;
    recreateModifiedFields: ?boolean;
    lockSchemas: ?boolean;
    beforeMigration: ?() => void | Promise<void>;
    afterMigration: ?() => void | Promise<void>;
}

export type FieldValueType =
    | 'String'
    | 'Boolean'
    | 'File'
    | 'Number'
    | 'Relation'
    | 'Pointer'
    | 'Date'
    | 'GeoPoint'
    | 'Polygon'
    | 'Array'
    | 'Object'
    | 'ACL';

export interface FieldType {
    type: FieldValueType;
    required?: boolean;
    defaultValue?: mixed;
    targetClass?: string;
}

type ClassNameType = '_User' | '_Role' | string;

export interface ProtectedFieldsInterface {
    [key: string]: string[];
}

export interface IndexInterface {
    [key: string]: number;
}

export interface IndexesInterface {
    [key: string]: IndexInterface;
}

export type CLPOperation = 'find' | 'count' | 'get' | 'update' | 'create' | 'delete';
// @Typescript 4.1+ // type CLPPermission = 'requiresAuthentication' | '*' |  `user:${string}` | `role:${string}`

type CLPValue = { [key: string]: boolean };
type CLPData = { [key: string]: CLPOperation[] };
type CLPInterface = { [key: string]: CLPValue };

export interface JSONSchema {
    className: ClassNameType;
    fields?: { [key: string]: FieldType };
    indexes?: IndexesInterface;
    classLevelPermissions?: {
        find?: CLPValue,
        count?: CLPValue,
        get?: CLPValue,
        update?: CLPValue,
        create?: CLPValue,
        delete?: CLPValue,
        addField?: CLPValue,
        protectedFields?: ProtectedFieldsInterface,
    };
}