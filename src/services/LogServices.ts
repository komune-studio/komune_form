import fs from 'fs';
import path from 'path';

export default class LogServices {
    static logDirectory = path.join(__dirname, 'logs');
    static logFilePath = path.join(this.logDirectory, 'log_services.log');

    static logToFile = (message: string, error?: Error) => {
		if (!fs.existsSync(this.logDirectory)) {
			fs.mkdirSync(this.logDirectory);
		}

		let entry = `[${new Date().toISOString()}]  `;
		if (error) {
			entry += `ERROR:\nMessage: ${message}\nError Message: ${error.message}`;
			if (error.stack) {
				entry += `\nStack: ${error.stack}`;
			}
		} else {
			entry += message;
		}

		entry += '\n';

		fs.appendFile(this.logFilePath, entry, (err) => {
			if (err) console.error('Failed to write log to file:', err);
		});
	};
}