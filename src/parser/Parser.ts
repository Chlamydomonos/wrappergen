import { ParsedClass, ParsedConstructor, ParsedMethod, ParsedParam, ParsedType, ValueType } from './Parsed';
import type { Constructor, Method, Param } from '../ccConnector';
import { ProjectManager } from './ProjectManager';
import ccConnector from '../ccConnector';

export class Parser {
    readonly classes = new Map<string, ParsedClass>();
    private readonly rawConstructors: Constructor[] = [];
    private readonly rawMethods: Method[] = [];

    private buildArgs(project: ProjectManager) {
        const args: string[] = [];
        for (const includeDir of project.includeDirs) {
            args.push(`-extra-arg=-I${includeDir}`);
        }
        return args;
    }

    private rawParse(project: ProjectManager) {
        for (const file of project.sourceFiles) {
            console.log('Parsing file:', file);
            const ccArgs = ['wrappergen', file, ...this.buildArgs(project)];
            console.log('Args:', ccArgs);
            const result = ccConnector.parse(ccArgs);
            if (!result) {
                throw new Error(`Parse file ${file} failed!`);
            }
            for (const rawClass of result.classes) {
                const parentNames: string[] = [];
                try {
                    for (const name of rawClass.parentNames) {
                        const result = /^\s*class\s*(\S+)\s*$/.exec(name);
                        if (!result) {
                            throw new Error();
                        }
                        parentNames.push(result[1]);
                    }
                } catch (e) {
                    continue;
                }
                this.classes.set(rawClass.name, new ParsedClass(rawClass.name, parentNames));
            }
            this.rawConstructors.push(...result.constructors);
            this.rawMethods.push(...result.methods);
        }
    }

    private processType(typeName: string): ParsedType {
        let hasDefault = false;
        const defaultResult = /^\s*HasDefault\s*<\s*(.*)\s*>\s*$/.exec(typeName);
        if (defaultResult) {
            typeName = defaultResult[1];
            hasDefault = true;
        }

        if (/^\s*i8\s*$/.test(typeName)) {
            return { type: ValueType.I8, hasDefault };
        } else if (/^\s*i16\s*$/.test(typeName)) {
            return { type: ValueType.I16, hasDefault };
        } else if (/^\s*i32\s*$/.test(typeName)) {
            return { type: ValueType.I32, hasDefault };
        } else if (/^\s*i64\s*$/.test(typeName)) {
            return { type: ValueType.I64, hasDefault };
        } else if (/^\s*u8\s*$/.test(typeName)) {
            return { type: ValueType.U8, hasDefault };
        } else if (/^\s*u16\s*$/.test(typeName)) {
            return { type: ValueType.U16, hasDefault };
        } else if (/^\s*u32\s*$/.test(typeName)) {
            return { type: ValueType.U32, hasDefault };
        } else if (/^\s*u64\s*$/.test(typeName)) {
            return { type: ValueType.U64, hasDefault };
        } else if (/^\s*f32\s*$/.test(typeName)) {
            return { type: ValueType.F32, hasDefault };
        } else if (/^\s*f64\s*$/.test(typeName)) {
            return { type: ValueType.F64, hasDefault };
        } else if (/^\s*boolean\s*$/.test(typeName)) {
            return { type: ValueType.BOOL, hasDefault };
        } else if (/^\s*CString\s*$/.test(typeName)) {
            return { type: ValueType.CSTRING, hasDefault };
        } else if (/^\s*(Const)?String\s*$/.test(typeName)) {
            return { type: ValueType.STRING, hasDefault };
        } else if (/^\s*void\s*$/.test(typeName)) {
            return { type: ValueType.VOID, hasDefault };
        } else {
            const isRef = /^\s*Ref\s*<\s*(.*)\s*>\s*$/.exec(typeName);
            if (!isRef) {
                throw new Error(`Unknown type name: ${typeName}`);
            }

            let name = isRef[1];
            const isComplexName = /^\s*.*\s+(\S+)\s*$/.exec(name);
            if (isComplexName) {
                name = isComplexName[1];
            }

            return { type: ValueType.REF, ref: name, hasDefault };
        }
    }

    private processParam(rawParam: Param): ParsedParam {
        return new ParsedParam(rawParam.name, this.processType(rawParam.typeName));
    }

    private processConstructor(rawConstructor: Constructor): ParsedConstructor {
        return new ParsedConstructor(rawConstructor.params.map(this.processParam.bind(this)));
    }

    private processMethod(rawMethod: Method): ParsedMethod {
        return new ParsedMethod(
            rawMethod.name,
            this.processType(rawMethod.returnTypeName),
            rawMethod.params.map(this.processParam.bind(this))
        );
    }

    private process() {
        for (const rawConstructor of this.rawConstructors) {
            try {
                const parsedConstructor = this.processConstructor(rawConstructor);
                const parsedClass = this.classes.get(rawConstructor.className);
                if (!parsedClass) {
                    continue;
                }
                parsedClass.constructors.push(parsedConstructor);
            } catch (e) {
                continue;
            }
        }
        for (const rawMethod of this.rawMethods) {
            try {
                if (rawMethod.name == rawMethod.className || rawMethod.name.startsWith('~')) {
                    continue;
                }
                const parsedMethod = this.processMethod(rawMethod);
                const parsedClass = this.classes.get(rawMethod.className);
                if (!parsedClass) {
                    continue;
                }
                parsedClass.methods.push(parsedMethod);
            } catch (e) {
                continue;
            }
        }
    }

    private postProcess() {
        let classes: ParsedClass[] = [];
        const parents = new Set<string>();
        for (const entry of this.classes.entries()) {
            classes.push(entry[1]);
            for (const name of entry[1].parentNames) {
                parents.add(name);
            }
        }

        classes = classes.filter((value, _i, _a) => {
            if (!/[A-Z]/.test(value.name.charAt(0))) {
                return false;
            }
            if (parents.has(value.name)) {
                return true;
            }
            if (value.methods.length == 0) {
                return false;
            }
            return true;
        });
        this.classes.clear();
        for (const value of classes) {
            this.classes.set(value.name, value);
        }
    }

    private mergeClasses() {
        for (const entry of this.classes.entries()) {
            const parsedClass = entry[1];
            const classQueue: ParsedClass[] = [];
            const parentNames = new Set<string>();
            for (const name of parsedClass.parentNames) {
                const parent = this.classes.get(name);
                if (parent) {
                    classQueue.push(parent);
                }
            }

            const methodMap = new Map<string, ParsedMethod>();
            for (const method of parsedClass.methods) {
                methodMap.set(method.name, method);
            }

            while (classQueue.length > 0) {
                const parent = classQueue.shift()!;
                parentNames.add(parent.name);
                for (const name of parent.parentNames) {
                    const grandParent = this.classes.get(name);
                    if (grandParent) {
                        classQueue.push(grandParent);
                    }
                }
                for (const method of parent.methods) {
                    methodMap.set(method.name, method);
                }
            }
            parsedClass.methods = [...methodMap.values()];
            parsedClass.parentNames = [...parentNames];
        }
    }

    parse(project: ProjectManager) {
        this.rawParse(project);
        this.process();
        this.postProcess();
        this.mergeClasses();
    }
}
