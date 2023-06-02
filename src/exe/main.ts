#!/usr/bin/env node

import { Command } from 'commander';
import * as Mustache from 'mustache';
import { Parser, ProjectManager } from '../parser';
import { ConfigReader, ConfigAssembler } from '../config';
import * as fs from 'fs';
import * as path from 'path';

const app = new Command();

app.option('-i, --include-dir <includeDir...>', 'Add include dir');
app.option('-s, --source-file <sourceFile...>', 'Add source file');
app.option('-c, --config-file <configFile>', 'Config file');
app.option('-w, --working-dir <workingDir>', 'Working dir');
app.parse(process.argv);

if (!app.opts().workingDir) {
    console.error('Working dir must be specified.');
    process.exit(1);
}

const root = path.resolve(app.opts().workingDir);

if (!app.opts().configFile) {
    console.error('Config file must be specified.');
    process.exit(1);
}

if (!fs.existsSync(app.opts().configFile)) {
    console.error('Config file does not exist.');
    process.exit(1);
}

const configReader = new ConfigReader();
configReader.read(app.opts().configFile);

if (!app.opts().includeDir) {
    app.opts().includeDir = [];
}

if (!app.opts().sourceFile) {
    app.opts().sourceFile = [];
}

const project = new ProjectManager();
for (const includeDir of app.opts().includeDir) {
    project.addIncludeDirs(path.resolve(root, includeDir));
}
for (const sourceFile of app.opts().sourceFile) {
    project.addSourceFiles(path.resolve(root, sourceFile));
}

const parser = new Parser();
parser.parse(project);

const configAssembler = new ConfigAssembler();
configAssembler.assemble(parser, configReader);

const ccIncludeOutputPath = path.resolve(root, configReader.ccIncludeOutputPath);
const ccSrcOutputPath = path.resolve(root, configReader.ccSrcOutputPath);
const tsOutputPath = path.resolve(root, configReader.tsOutputPath);

if (fs.existsSync(ccIncludeOutputPath)) {
    fs.rmdirSync(ccIncludeOutputPath, { recursive: true });
}
if (fs.existsSync(ccSrcOutputPath)) {
    fs.rmdirSync(ccSrcOutputPath, { recursive: true });
}
if (fs.existsSync(tsOutputPath)) {
    fs.rmdirSync(tsOutputPath, { recursive: true });
}

function checkAndMkdir(dir: string) {
    if (!fs.existsSync(dir)) {
        checkAndMkdir(path.resolve(dir, '..'));
        fs.mkdirSync(dir);
    }
}

checkAndMkdir(ccIncludeOutputPath);
checkAndMkdir(ccSrcOutputPath);
checkAndMkdir(tsOutputPath);

const templatePath = path.resolve(__dirname, '../../templates');

const wrapperHHTemplate = fs.readFileSync(path.resolve(templatePath, 'wrapper.hh.mustache'), 'utf-8');
const wrapperCCTemplate = fs.readFileSync(path.resolve(templatePath, 'wrapper.cc.mustache'), 'utf-8');
const wrapperTSTemplate = fs.readFileSync(path.resolve(templatePath, 'wrapper.ts.mustache'), 'utf-8');
const indexHHTemplate = fs.readFileSync(path.resolve(templatePath, 'index.hh.mustache'), 'utf-8');
const typesTsTemplate = fs.readFileSync(path.resolve(templatePath, 'types.ts.mustache'), 'utf-8');
const indexTsTemplate = fs.readFileSync(path.resolve(templatePath, 'index.ts.mustache'), 'utf-8');

const indexHH = Mustache.render(indexHHTemplate, configAssembler);
fs.writeFileSync(path.resolve(ccIncludeOutputPath, 'index.hh'), indexHH);

const typesTs = Mustache.render(typesTsTemplate, configAssembler);
fs.writeFileSync(path.resolve(tsOutputPath, 'types.ts'), typesTs);

const indexTs = Mustache.render(indexTsTemplate, configAssembler);
fs.writeFileSync(path.resolve(tsOutputPath, 'index.ts'), indexTs);

for (const classConfig of configAssembler.classes) {
    const wrapperHH = Mustache.render(wrapperHHTemplate, classConfig);
    fs.writeFileSync(path.resolve(ccIncludeOutputPath, `${classConfig.name}Wrapper.hh`), wrapperHH);

    const wrapperCC = Mustache.render(wrapperCCTemplate, classConfig);
    fs.writeFileSync(path.resolve(ccSrcOutputPath, `${classConfig.name}Wrapper.cc`), wrapperCC);

    const wrapperTS = Mustache.render(wrapperTSTemplate, classConfig);
    fs.writeFileSync(path.resolve(tsOutputPath, `${classConfig.name}.ts`), wrapperTS);
}
