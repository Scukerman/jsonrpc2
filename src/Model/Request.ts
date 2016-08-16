namespace JSONRPC2 {
	export namespace Model {
		import GUID = JSONRPC2.Helper.GUID;
		export class Request extends ClientRequest {
			constructor(method: string, params?: any[] | { [ arg: string ]: any; }) {
				super(method, params);
				this.id = GUID.generate();
			}
		}
	}
}
