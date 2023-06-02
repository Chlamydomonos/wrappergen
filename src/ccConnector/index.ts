import * as path from 'path';
import * as fs from 'fs';

export interface Param {
    name: string;
    typeName: string;
}

export interface Class {
    name: string;
    parentNames: string[];
}

export interface Constructor {
    className: string;
    params: Param[];
}

export interface Method {
    name: string;
    returnTypeName: string;
    className: string;
    params: Param[];
}

export interface ParseResult {
    classes: Class[];
    constructors: Constructor[];
    methods: Method[];
}

let ccLibDir = path.resolve(__dirname, '../../build/Release/ccLib.node');
if (!fs.existsSync(ccLibDir) || !fs.statSync(ccLibDir).isFile()) {
    ccLibDir = path.resolve(__dirname, '../../build/Debug/ccLib.node');
}

const ccLib = require(ccLibDir);

export default { parse: ccLib.parse as (args: string[]) => ParseResult | null };
