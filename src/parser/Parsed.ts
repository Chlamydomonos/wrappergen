export enum ValueType {
    I8 = 0,
    I16,
    I32,
    I64,
    U8,
    U16,
    U32,
    U64,
    F32,
    F64,
    BOOL,
    CSTRING,
    STRING,
    VOID,
    REF,
    CREF,
}

interface SimpleParsedType {
    type: Exclude<ValueType, ValueType.REF | ValueType.CREF>;
}

interface RefParsedType {
    type: ValueType.REF | ValueType.CREF;
    ref: string;
}

export type ParsedType = (SimpleParsedType | RefParsedType) & { hasDefault: boolean };

export class ParsedParam {
    constructor(public name: string, public type: ParsedType) {}
}

export class ParsedMethod {
    constructor(public name: string, public returnType: ParsedType, public params: ParsedParam[]) {}
}

export class ParsedConstructor {
    constructor(public params: ParsedParam[]) {}
}

export class ParsedClass {
    constructors: ParsedConstructor[] = [];
    methods: ParsedMethod[] = [];
    constructor(public name: string, public parentNames: string[]) {}
}
