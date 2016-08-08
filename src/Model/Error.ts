namespace JSONRPC2 {
	export namespace Model {
		export class Error extends ServerResponse {
			constructor(error: {code: number, message: string, data?: any}, id: number|string) {
				super();
				this.error = error;
				this.id = id;
			}

			public getCode(): number {
				return this.error.code;
			}

			public getMessage(): string {
				return this.error.message;
			}

			public getData(): any {
				return this.error.data || {};
			}
		}
	}
}
