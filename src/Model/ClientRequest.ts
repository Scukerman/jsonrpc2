namespace JSONRPC2 {
	export namespace Model {
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
				let pkt = this;
				if(this.params == undefined) {
					pkt = jQuery.extend(true, {}, this);
					delete pkt['params'];
				}
				return JSON.stringify(pkt);
			}

			public send(c: JSONRPC2.Client): JQueryPromise<ServerResponse>|void {
				return c.execute(this);
			}

			public getID(): number|string {
				return this.id;
			}
		}
	}
}
