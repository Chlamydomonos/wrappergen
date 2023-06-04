import { Parser } from '../parser';
import { ParsedType, ValueType } from '../parser/Parsed';
import { ConfigReader } from './ConfigReader';

type RenderFunc = () => (text: string, render: (text: string) => string) => string;

export interface TypeConfig {
    isRef: boolean;
    ccName: string;
    tsName: string;
    importName: string;
    napiNew: RenderFunc;
    parseArg: RenderFunc;
}

export interface ParamConfig {
    id: number;
    name: string;
    type: TypeConfig;
    isLast: boolean;
}

export interface ConstructorConfig {
    isFirst: boolean;
    id: number;
    className: string;
    paramCount: number;
    params: ParamConfig[];
}

export interface MethodConfig {
    name: string;
    className: string;
    params: ParamConfig[];
    returnType: TypeConfig;
    isVoid: boolean;
}

export interface ClassConfig {
    name: string;
    header: string;
    constructors: ConstructorConfig[];
    methods: MethodConfig[];
    importedTypes: { name: string }[];
    importedClasses: { name: string }[];
    parentTypes: { name: string }[];
}

export class ConfigAssembler {
    types: TypeConfig[] = [];
    classes: ClassConfig[] = [];
    tsImportSentence = '';

    private getIsRef(type: ParsedType) {
        return type.type == ValueType.REF || type.type == ValueType.CREF;
    }

    private getCCName(type: ParsedType) {
        if (type.type == ValueType.I8) {
            return 'i8';
        } else if (type.type == ValueType.I16) {
            return 'i16';
        } else if (type.type == ValueType.I32) {
            return 'i32';
        } else if (type.type == ValueType.I64) {
            return 'i64';
        } else if (type.type == ValueType.U8) {
            return 'u8';
        } else if (type.type == ValueType.U16) {
            return 'u16';
        } else if (type.type == ValueType.U32) {
            return 'u32';
        } else if (type.type == ValueType.U64) {
            return 'u64';
        } else if (type.type == ValueType.F32) {
            return 'f32';
        } else if (type.type == ValueType.F64) {
            return 'f64';
        } else if (type.type == ValueType.BOOL) {
            return 'bool';
        } else if (type.type == ValueType.CSTRING) {
            return 'CString';
        } else if (type.type == ValueType.STRING) {
            return 'String';
        } else if (type.type == ValueType.VOID) {
            return 'void';
        } else if (type.type == ValueType.REF) {
            return `Ref<${type.ref}>`;
        } else if (type.type == ValueType.CREF) {
            return `ConstRef<${type.ref}>`;
        } else {
            throw new Error(`Unknown type: ${type} (this is impossible)`);
        }
    }

    private getTSName(type: ParsedType) {
        if (type.type == ValueType.I8) {
            return 'number';
        } else if (type.type == ValueType.I16) {
            return 'number';
        } else if (type.type == ValueType.I32) {
            return 'number';
        } else if (type.type == ValueType.I64) {
            return 'number';
        } else if (type.type == ValueType.U8) {
            return 'number';
        } else if (type.type == ValueType.U16) {
            return 'number';
        } else if (type.type == ValueType.U32) {
            return 'number';
        } else if (type.type == ValueType.U64) {
            return 'number';
        } else if (type.type == ValueType.F32) {
            return 'number';
        } else if (type.type == ValueType.F64) {
            return 'number';
        } else if (type.type == ValueType.BOOL) {
            return 'boolean';
        } else if (type.type == ValueType.CSTRING) {
            return 'string';
        } else if (type.type == ValueType.STRING) {
            return 'string';
        } else if (type.type == ValueType.VOID) {
            return 'void';
        } else if (type.type == ValueType.REF) {
            return `Ref<CType_${type.ref}>`;
        } else if (type.type == ValueType.CREF) {
            return `ConstRef<CType_${type.ref}>`;
        } else {
            throw new Error(`Unknown type: ${type} (this is impossible)`);
        }
    }

    private getImportName(type: ParsedType) {
        if (type.type == ValueType.I8) {
            return 'Number';
        } else if (type.type == ValueType.I16) {
            return 'Number';
        } else if (type.type == ValueType.I32) {
            return 'Number';
        } else if (type.type == ValueType.I64) {
            return 'Number';
        } else if (type.type == ValueType.U8) {
            return 'Number';
        } else if (type.type == ValueType.U16) {
            return 'Number';
        } else if (type.type == ValueType.U32) {
            return 'Number';
        } else if (type.type == ValueType.U64) {
            return 'Number';
        } else if (type.type == ValueType.F32) {
            return 'Number';
        } else if (type.type == ValueType.F64) {
            return 'Number';
        } else if (type.type == ValueType.BOOL) {
            return 'Boolean';
        } else if (type.type == ValueType.CSTRING) {
            return 'String';
        } else if (type.type == ValueType.STRING) {
            return 'String';
        } else if (type.type == ValueType.VOID) {
            return '';
        } else if (type.type == ValueType.REF) {
            return `CType_${type.ref}`;
        } else if (type.type == ValueType.CREF) {
            return `CType_${type.ref}`;
        } else {
            throw new Error(`Unknown type: ${type} (this is impossible)`);
        }
    }

    private getNAPINew(type: ParsedType): RenderFunc {
        if (type.type == ValueType.I8) {
            return () => (text, _render) => `Napi::Number::New(env, ${text})`;
        } else if (type.type == ValueType.I16) {
            return () => (text, _render) => `Napi::Number::New(env, ${text})`;
        } else if (type.type == ValueType.I32) {
            return () => (text, _render) => `Napi::Number::New(env, ${text})`;
        } else if (type.type == ValueType.I64) {
            return () => (text, _render) => `Napi::Number::New(env, ${text})`;
        } else if (type.type == ValueType.U8) {
            return () => (text, _render) => `Napi::Number::New(env, ${text})`;
        } else if (type.type == ValueType.U16) {
            return () => (text, _render) => `Napi::Number::New(env, ${text})`;
        } else if (type.type == ValueType.U32) {
            return () => (text, _render) => `Napi::Number::New(env, ${text})`;
        } else if (type.type == ValueType.U64) {
            return () => (text, _render) => `Napi::Number::New(env, ${text})`;
        } else if (type.type == ValueType.F32) {
            return () => (text, _render) => `Napi::Number::New(env, ${text})`;
        } else if (type.type == ValueType.F64) {
            return () => (text, _render) => `Napi::Number::New(env, ${text})`;
        } else if (type.type == ValueType.BOOL) {
            return () => (text, _render) => `Napi::Boolean::New(env, ${text})`;
        } else if (type.type == ValueType.CSTRING) {
            return () => (text, _render) => `Napi::String::New(env, ${text})`;
        } else if (type.type == ValueType.STRING) {
            return () => (text, _render) => `Napi::String::New(env, ${text})`;
        } else if (type.type == ValueType.VOID) {
            return () => (text, _render) => `Napi::Value()`;
        } else if (type.type == ValueType.REF) {
            return () => (text, _render) => `Napi::External<${type.ref}>::New(env, &${text})`;
        } else if (type.type == ValueType.CREF) {
            return () => (text, _render) => `Napi::External<const ${type.ref}>::New(env, &${text})`;
        } else {
            throw new Error(`Unknown type: ${type} (this is impossible)`);
        }
    }

    private getParseArg(type: ParsedType): RenderFunc {
        if (type.type == ValueType.I8) {
            return () => (text, _render) => `static_cast<i8>(${text}.As<Napi::Number>().Int32Value())`;
        } else if (type.type == ValueType.I16) {
            return () => (text, _render) => `static_cast<i16>(${text}.As<Napi::Number>().Int32Value())`;
        } else if (type.type == ValueType.I32) {
            return () => (text, _render) => `static_cast<i32>(${text}.As<Napi::Number>().Int32Value())`;
        } else if (type.type == ValueType.I64) {
            return () => (text, _render) => `static_cast<i64>(${text}.As<Napi::Number>().Int64Value())`;
        } else if (type.type == ValueType.U8) {
            return () => (text, _render) => `static_cast<u8>(${text}.As<Napi::Number>().Uint32Value())`;
        } else if (type.type == ValueType.U16) {
            return () => (text, _render) => `static_cast<u16>(${text}.As<Napi::Number>().Uint32Value())`;
        } else if (type.type == ValueType.U32) {
            return () => (text, _render) => `static_cast<u32>(${text}.As<Napi::Number>().Uint32Value())`;
        } else if (type.type == ValueType.U64) {
            return () => (text, _render) => `static_cast<u64>(${text}.As<Napi::Number>().DoubleValue())`;
        } else if (type.type == ValueType.F32) {
            return () => (text, _render) => `static_cast<f32>(${text}.As<Napi::Number>().DoubleValue())`;
        } else if (type.type == ValueType.F64) {
            return () => (text, _render) => `static_cast<f64>(${text}.As<Napi::Number>().DoubleValue())`;
        } else if (type.type == ValueType.BOOL) {
            return () => (text, _render) => `${text}.As<Napi::Boolean>().Value()`;
        } else if (type.type == ValueType.CSTRING) {
            return () => (text, _render) => `std::string(${text}.As<Napi::String>()).c_str()`;
        } else if (type.type == ValueType.STRING) {
            return () => (text, _render) => `std::string(${text}.As<Napi::String>())`;
        } else if (type.type == ValueType.VOID) {
            return () => (text, _render) => ``;
        } else if (type.type == ValueType.REF) {
            return () => (text, _render) =>
                `*(${text}.IsExternal() ? ${text}.As<Napi::External<${type.ref}>>().Data() : ${text}.As<Napi::Object>().Get("getValue").As<Napi::Function>().Call(${text}, {}).As<Napi::External<${type.ref}>>().Data())`;
        } else if (type.type == ValueType.CREF) {
            return () => (text, _render) =>
                `*(${text}.IsExternal() ? ${text}.As<Napi::External<${type.ref}>>().Data() : ${text}.As<Napi::Object>().Get("getValue").As<Napi::Function>().Call(${text}, {}).As<Napi::External<${type.ref}>>().Data())`;
        } else {
            throw new Error(`Unknown type: ${type} (this is impossible)`);
        }
    }

    assemble(parser: Parser, config: ConfigReader) {
        this.tsImportSentence = config.tsImportSentence;
        const typeMap = new Map<string, TypeConfig>();
        for (const i of parser.classes.entries()) {
            const parserClass = i[1];

            const importedTypeMap = new Map<string, TypeConfig>();

            let constructorId = 0;
            const constructors: ConstructorConfig[] = [];
            for (const constructor of parserClass.constructors) {
                const params: ParamConfig[] = [];
                let optionalParamCount = 0;
                let paramId = 1;
                for (const param of constructor.params) {
                    const type = param.type;
                    const typeConfig: TypeConfig = {
                        isRef: this.getIsRef(type),
                        ccName: this.getCCName(type),
                        tsName: this.getTSName(type),
                        importName: this.getImportName(type),
                        napiNew: this.getNAPINew(type),
                        parseArg: this.getParseArg(type),
                    };
                    if (type.type == ValueType.REF || type.type == ValueType.CREF) {
                        typeMap.set(type.ref, typeConfig);
                        importedTypeMap.set(type.ref, typeConfig);
                    }
                    params.push({
                        id: paramId,
                        name: param.name,
                        type: typeConfig,
                        isLast: false,
                    });
                    paramId++;

                    if (type.hasDefault) {
                        optionalParamCount++;
                    }
                }
                for (; optionalParamCount >= 0; optionalParamCount--) {
                    if (params.length > 0) {
                        params[params.length - 1] = { ...params[params.length - 1] };
                        params[params.length - 1].isLast = true;
                    }
                    constructors.push({
                        isFirst: constructorId == 0,
                        id: constructorId,
                        className: parserClass.name,
                        paramCount: params.length + 1,
                        params: [...params],
                    });
                    if (params.length > 0) {
                        params.pop();
                    }
                    constructorId++;
                }
            }

            const methods: MethodConfig[] = [];
            for (const method of parserClass.methods) {
                const params: ParamConfig[] = [];

                let paramId = 0;
                for (const param of method.params) {
                    const type = param.type;
                    const typeConfig: TypeConfig = {
                        isRef: this.getIsRef(type),
                        ccName: this.getCCName(type),
                        tsName: this.getTSName(type),
                        importName: this.getImportName(type),
                        napiNew: this.getNAPINew(type),
                        parseArg: this.getParseArg(type),
                    };
                    if (type.type == ValueType.REF || type.type == ValueType.CREF) {
                        typeMap.set(type.ref, typeConfig);
                        importedTypeMap.set(type.ref, typeConfig);
                    }
                    params.push({
                        id: paramId,
                        name: param.name,
                        type: typeConfig,
                        isLast: false,
                    });
                }
                const returnType = method.returnType;
                const returnTypeConfig: TypeConfig = {
                    isRef: this.getIsRef(returnType),
                    ccName: this.getCCName(returnType),
                    tsName: this.getTSName(returnType),
                    importName: this.getImportName(returnType),
                    napiNew: this.getNAPINew(returnType),
                    parseArg: this.getParseArg(returnType),
                };
                if (returnType.type == ValueType.REF || returnType.type == ValueType.CREF) {
                    typeMap.set(returnType.ref, returnTypeConfig);
                    importedTypeMap.set(returnType.ref, returnTypeConfig);
                }

                if (params.length > 0) {
                    params[params.length - 1].isLast = true;
                }
                methods.push({
                    name: method.name,
                    className: parserClass.name,
                    params,
                    returnType: returnTypeConfig,
                    isVoid: returnType.type == ValueType.VOID,
                });
            }

            const tempImportedTypes = new Map<string, { name: string }>();
            const tempImportedClasses = new Map<string, { name: string }>();
            for (const i of importedTypeMap.entries()) {
                if (config.headerMap.has(i[0])) {
                    tempImportedClasses.set(i[0], { name: i[0] });
                } else {
                    tempImportedTypes.set(i[0], { name: i[1].importName });
                }
            }

            for (const name of parserClass.parentNames) {
                if (config.headerMap.has(name)) {
                    tempImportedClasses.set(name, { name });
                } else {
                    tempImportedTypes.set(name, { name: `CType_${name}` });
                    typeMap.set(name, {
                        isRef: true,
                        ccName: name,
                        tsName: `CType_${name}`,
                        importName: `CType_${name}`,
                        napiNew: () => (_text, _render) => ``,
                        parseArg: () => (_text, _render) => ``,
                    });
                }
            }

            const importedTypes = [...tempImportedTypes.values()];
            const importedClasses = [...tempImportedClasses.values()];
            const parentTypes = parserClass.parentNames.map((name) => ({ name: `CType_${name}` }));

            if (constructors.length > 0 && config.headerMap.has(parserClass.name)) {
                this.classes.push({
                    name: parserClass.name,
                    header: config.headerMap.get(parserClass.name)!,
                    constructors,
                    methods,
                    importedTypes,
                    importedClasses,
                    parentTypes,
                });
            }
        }

        for (const i of typeMap.entries()) {
            if (!config.headerMap.has(i[0])) {
                this.types.push(i[1]);
            }
        }
    }
}
