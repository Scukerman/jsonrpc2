namespace JSONRPC2 {
	export namespace Model {
		import Logger = JSONRPC2.Helper.Logger;

		export interface ClientRequestInterface {
			jsonrpc: string;
			method: string;
			params?: any[] | { [ arg: string ]: any; };
			id?: number|string;
		}

		export class ClientRequest {
			protected jsonrpc: string = JSONRPC2.VERSION;
			protected method: string;
			protected params: any[] | { [ arg: string ]: any; };
			protected id: number|string;

			constructor(method: string, params?: any[] | { [ arg: string ]: any; }, id?: number|string) {
				this.method = method;
				this.params = params;
				this.id = id;
			}

			public toJson(): string {
				let pkt = jQuery.extend(true, {}, this);

				// if notification
				if(this.id == undefined) {
					delete pkt['id'];
				}

				// if no params
				if(this.params == undefined) {
					delete pkt['params'];
				}

				return JSON.stringify(pkt);
			}

			public static fromJson(json: string): ClientRequest|Error {
				let result = Validator.tryParseJSON(json);

				if(!result.valid) {
					Logger.error("Not a valid JSON request is gotten");
					return new Error(JSONRPC2.ErrParseError, null);
				}

				let pkt: ClientRequestInterface = result.json;

				if(!('jsonrpc' in pkt) || pkt.jsonrpc != JSONRPC2.VERSION) {
					return new Error(JSONRPC2.ErrInvalidRequest, null);
				}

				if('id' in pkt) {
					return new ClientRequest(pkt.method, pkt.params, pkt.id);
				} else {
					return new Notification(pkt.method, pkt.params);
				}
			}

			public send(c: JSONRPC2.Client): JQueryPromise<ServerResponse>|void {
				return c.execute(this);
			}

			public getID(): number|string {
				return this.id;
			}

			public getMethod(): string {
				return this.method;
			}

			public getParams() {
				return this.params;
			}
		}
	}
}
