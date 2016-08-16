namespace JSONRPC2 {
	export namespace Model {
		import Logger = JSONRPC2.Helper.Logger;
		export interface ServerResponseInterface {
			jsonrpc: string;
			result?: any;
			error?: ErrorInterface;
			id: number|string;
		}

		export class ServerResponse {
			protected jsonrpc: string = JSONRPC2.VERSION;
			protected result: any;
			protected error: ErrorInterface;
			protected id: number|string;

			public static fromJson(json: string): ServerResponse {
				let result = Validator.tryParseJSON(json);
				let pkt: ServerResponseInterface;

				if(!result.valid) {
					Logger.error("Not a valid JSON response is gotten");
					return new Error(JSONRPC2.ErrParseError, null);
				} else {
					pkt = result.json;
				}

				if(!('jsonrpc' in pkt) || pkt.jsonrpc != JSONRPC2.VERSION) {
					return new Error(JSONRPC2.ErrInvalidRequest, null);
				}

				if('result' in pkt) {
					return new Response(pkt.result, pkt.id);
				} else if('error' in pkt) {
					return new Error(pkt.error, pkt.id);
				}
			}

			public toJson(): string {
				let pkt = jQuery.extend(true, {}, this);

				// if notification
				if(this.id == undefined) {
					delete pkt['id'];
				}

				// if no error
				if(this.error == undefined) {
					delete pkt['error'];
				}

				// if no result
				if(this.result == undefined) {
					delete pkt['result'];
				}

				return JSON.stringify(pkt);
			}

			public getID(): number|string {
				return this.id;
			}

			public getResult(): any {
				return this.result;
			}

			public getError(): ErrorInterface {
				return this.error;
			}
		}
	}
}
