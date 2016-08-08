namespace JSONRPC2 {
	export class Client {
        constructor(private transport: Transport.Transport) {
        	transport.initiate();
        }

        public execute(req: JSONRPC2.Model.ClientRequest): JQueryPromise<JSONRPC2.Model.ServerResponse> {
			return this.transport.doRequest(req);
        }
    }
}
