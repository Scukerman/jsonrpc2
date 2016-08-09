namespace JSONRPC2 {
	export namespace Transport {
		export interface Transport {
			doRequest(req: JSONRPC2.Model.ClientRequest): JQueryPromise<JSONRPC2.Model.ServerResponse>;
			setup();
			close();
		}
	}
}