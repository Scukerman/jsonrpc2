namespace JSONRPC2 {
	export namespace Model {
		export class Response extends ServerResponse {
			constructor(result: any, id: number|string) {
				super();
				this.result = result;
				this.id = id;
			}

			public getResult(): any {
				return this.result;
			}
		}
	}
}
