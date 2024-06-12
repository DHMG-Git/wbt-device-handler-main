import fs from 'fs';

export default class LoggerService {

    static keepDays = 14;
    static logPath = 'log/';

    static writeLog(message) {

        const date = new Date().toLocaleString()
        const content = `${date} ${message} \n`
        const fileName = new Date().toISOString().split('T')[0];

        fs.appendFile(`${this.logPath}${fileName}.log`, content, err => {
            if (err) {
                console.error('LoggerService [16]: ' + err);
            }
            // done!
        });
    }

    static cleanUpLogFiles() {

        fs.readdir(this.logPath, (err, files) => {

            console.log(files);
            if(files.length >= this.keepDays) {
                const filesToRemove = files.splice(0, files.length - this.keepDays);
                filesToRemove.forEach(file => {
                    fs.unlink(`${this.logPath}${file}`, (err) => {
                        if (err) {
                            this.writeLog('Error deleting file ' + file);
                            console.error(err)
                            return
                        }

                        console.log(file + ' file removed');
                    })
                })
            }
        });

    }

}