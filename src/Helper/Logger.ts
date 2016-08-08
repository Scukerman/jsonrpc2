namespace JSONRPC2 {
	export namespace Helper {
		export enum LoggerType {
			LOG = 0,
			DEBUG,
			ERROR,
			INFO,
			WARN
		}
		export class Logger {
			private static types: string[] = ['log', 'debug', 'error', 'info', 'warn'];

			public static log(...messages: any[]) {
				Logger.write(LoggerType.LOG, messages);
			}

			public static debug(...messages: any[]) {
				Logger.write(LoggerType.DEBUG, messages);
			}

			public static error(...messages: any[]) {
				Logger.write(LoggerType.ERROR, messages);
			}

			public static info(...messages: any[]) {
				Logger.write(LoggerType.INFO, messages);
			}

			public static warn(...messages: any[]) {
				Logger.write(LoggerType.WARN, messages);
			}

			private static write(type: LoggerType, messages: any[]) {
				let date = Logger.getDate();
				messages.unshift('[' + date + ']');
				console[Logger.types[type]].apply(console, messages);
			}

			private static getDate(): string {
				let date = new Date();
				return [('0' + date.getDate()).slice(-2), ('0' + (date.getMonth() + 1)).slice(-2), date.getFullYear()].join('-') + ' ' + [('0' + date.getHours()).slice(-2), ('0' + date.getMinutes()).slice(-2), ('0' + date.getSeconds()).slice(-2)].join(':');
			}
		}
	}
}
