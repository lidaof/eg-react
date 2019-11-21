import Papa from 'papaparse';

/**
 * this script deal with text file input as track content, using Papa to initialize the content of input file
 * use bin index to index the data
 */

class TextSource {
    constructor(config) {
        this.config = config;
        this.url = '';
        this.blob = null;
        if (config.blob) {
            this.blob = config.blob;
        }
        if (config.url) {
            this.url = config.url;
        }
    }

    processTextFile() {
        let config, src;
        if (this.url.length) {
            src = this.url;
            config = { download: true, worker: this.config.isFileHuge };
        } else if (this.blob) {
            src = this.blob;
            config = { worker: this.config.isFileHuge };
        } else {
            console.error('no data source for TextSource, abort...');
        }
        return new Promise((resolve, reject) => {
            Papa.parse(src, {
                config,
                error: (err, file) => {
                    console.error(err, file);
                    reject(err);
                },
                complete: results => {
                    // resolve(JSON.parse(results.data))
                    resolve(results);
                }
            });
        });
    }

    init = async () => {
        const textData = await this.processTextFile();
        // console.log(textData);
        return textData;
    };
}

export default TextSource;
