namespace JSONRPC2 {
	export class Validator {
		public static isRequestPacket(data: string): boolean {
			return data.indexOf('"method":') > 0;
		}

		public static isResponsePacket(data: string): boolean {
			return data.indexOf('"result":') > 0 || data.indexOf('"error":') > 0;
		}

		public static tryParseJSON(data: string): {json?: any, valid: boolean} {
			var json;
			try {
				json = JSON.parse(data);
			} catch (e) {
				return {valid: false};
			}

			return {json: json, valid: true};
		}
	}
}
