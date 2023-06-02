import * as fs from 'fs';
import * as HJson from 'hjson';

export class ConfigReader {
    ccIncludeOutputPath = '';
    ccSrcOutputPath = '';
    tsOutputPath = '';
    tsImportSentence = '';
    readonly headerMap = new Map<string, string>();
    read(path: string) {
        const file = fs.readFileSync(path).toString();
        const parsed = HJson.parse(file);
        this.ccIncludeOutputPath = parsed.ccIncludeOutputPath;
        this.ccSrcOutputPath = parsed.ccSrcOutputPath;
        this.tsOutputPath = parsed.tsOutputPath;
        this.tsImportSentence = parsed.tsImportSentence;
        const classes = parsed.classes as Record<string, any>;
        for (const i in classes) {
            this.headerMap.set(i, classes[i]);
        }
    }
}
