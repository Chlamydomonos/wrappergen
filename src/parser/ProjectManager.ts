const matchRe = /(^".*")|(^\S*\s+)|(^\S*$)/;

export class ProjectManager {
    readonly sourceFiles: string[] = [];
    readonly includeDirs: string[] = [];
    addSourceFiles(sourceFiles: string) {
        while (sourceFiles.length > 0) {
            const match = matchRe.exec(sourceFiles);
            if (!match) {
                throw new Error('Wrong source files format! (This is impossible)');
            }
            console.log('Found source file:', match[0]);
            this.sourceFiles.push(match[0]);
            sourceFiles = sourceFiles.slice(match[0].length);
        }
    }
    addIncludeDirs(includeDirs: string) {
        while (includeDirs.length > 0) {
            const match = matchRe.exec(includeDirs);
            if (!match) {
                throw new Error('Wrong include dirs format! (This is impossible)');
            }
            console.log('Found include dir:', match[0]);
            this.includeDirs.push(match[0]);
            includeDirs = includeDirs.slice(match[0].length);
        }
    }
}
