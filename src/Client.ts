namespace JSONRPC2 {
	import Logger = JSONRPC2.Helper.Logger;
	import ClientRequest = JSONRPC2.Model.ClientRequest;
	export class Client {
		private promises: [string|number, JQueryDeferred<JSONRPC2.Model.ServerResponse>][] = [];
		private debug: boolean = false;

		constructor(private transport: Transport.Transport) {
			this.transport.addHandler(this.handleResponse.bind(this));
			this.transport.setup();
		}

		public useDebug(debug: boolean): Client {
			this.debug = debug;
			if(debug == true) {
				Logger.info('[Client]', 'Debug enabled');
			}
			return this;
		}

		public execute(req: JSONRPC2.Model.ClientRequest): JQueryPromise<JSONRPC2.Model.ServerResponse> {
			let dfd: JQueryDeferred<JSONRPC2.Model.ServerResponse> = jQuery.Deferred();
			let data: string = req.toJson();

			if(this.debug) {
				Logger.debug('[Client]', '[Request]', data);
			}

			this.promises.push([req.getID(), dfd]);
			this.transport.send(data);

			return dfd.promise();
		}

		private handleResponse(data: string): void {
			if(!Validator.isResponsePacket(data)) {
				return;
			}

			if(this.debug) {
				Logger.debug("[Client]", "[Response]", data);
			}

			let res = JSONRPC2.Model.ServerResponse.fromJson(data);

			let resolve = true;

			// determine the type
			if(res instanceof JSONRPC2.Model.Error) {
				resolve = false;
				if(res.getCode() === JSONRPC2.ErrParseError.code) {
					// memory leaking is expected
					// cannot resolve or reject because we don't have the ID
					Logger.error("Parse error:", data);
					return;
				}

				if(res.getCode() === JSONRPC2.ErrInvalidRequest.code) {
					// memory leaking is expected
					// cannot resolve or reject because we can't trust the ID we've got
					Logger.error("Invalid Request:", data);
					return;
				}
			}

			for (var i = 0; i < this.promises.length; ++i) {
				if(this.promises[i][0] === res.getID()) {
					// resolve or reject promise
					if(resolve) {
						this.promises[i][1].resolve(res.getResult());
					} else {
						this.promises[i][1].reject(res.getError());
					}

					// remove from heap
					this.promises.splice(i, 1);
					break;
				}
			}
		}

		public closeConnection(): void {
			this.transport.close();
		}
	}
}
