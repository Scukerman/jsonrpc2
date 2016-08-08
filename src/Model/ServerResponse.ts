namespace JSONRPC2 {
	export namespace Model {
		export class ServerResponse {
			protected jsonrpc: string;
			protected result: any;
			protected error: {code: number, message: string, data?: any};
			protected id: number|string;

			public static fromJson(json: string): ServerResponse {
				let res = JSON.parse(json);

				if('result' in res) {
					return new Response(res.result, res.id);
				} else if('error' in res) {
					return new Error(res.error, res.id);
				}
			}

			public getID(): number|string {
				return this.id;
			}
		}
	}
}
