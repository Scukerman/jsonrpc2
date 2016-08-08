namespace JSONRPC2 {
	export namespace Model {
		export class Notification extends ClientRequest {
			constructor(method: string, params?: any[] | { [ arg: string ]: any; }) {
				super(method, params);
				this.id = undefined;
			}

			public send(c: JSONRPC2.Client): JQueryPromise<JSONRPC2.Model.ServerResponse>|void {
				return super.send(c);
			}
		}
	}
}
