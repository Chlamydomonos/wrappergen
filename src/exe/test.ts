#!/usr/bin/env node

console.log('WrapperGen Test');

import Commander from 'commander';
import { Parser, ProjectManager } from '../parser';
import * as fs from 'fs';

const app = new Commander.Command();

app.option('-i, --include-dir <includeDir...>', 'Add include dir');
app.option('-s, --source-file <sourceFile...>', 'Add source file');
app.option('-o, --output <output>', 'Output file');
app.parse(process.argv);

const project = new ProjectManager();

if (app.opts().includeDir) {
    console.log('Include dir:', app.opts().includeDir);
    for (const includeDir of app.opts().includeDir) {
        project.addIncludeDirs(includeDir);
    }
}

if (app.opts().sourceFile) {
    console.log('Source file:', app.opts().sourceFile);
    for (const sourceFile of app.opts().sourceFile) {
        project.addSourceFiles(sourceFile);
    }
}

const parser = new Parser();
parser.parse(project);

const outputList: any[] = [];
for (let entry of parser.classes.entries()) {
    outputList.push(entry[1]);
}

const outputStr = JSON.stringify(outputList);

if (app.opts().output) {
    console.log('Output file:', app.opts().output);
    fs.writeFileSync(app.opts().output, outputStr);
}
