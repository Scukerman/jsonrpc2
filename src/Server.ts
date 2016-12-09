namespace JSONRPC2 {
	import Logger = JSONRPC2.Helper.Logger;
	import ClientRequest = JSONRPC2.Model.ClientRequest;
	export interface Receiver {
		[methodName: string]: (params: { [paramName: string]: any; }) => any;
	}

	export class Server {
		private transport: JSONRPC2.Transport.Transport;
		private receivers: { [name: string]: Receiver } = {};
		private debug: boolean = false;

		constructor(transport: JSONRPC2.Transport.Transport) {
			this.transport = transport;
			this.transport.addHandler(this.handleRequest.bind(this));
			this.transport.setup();

			Logger.info('[Server]', 'Server is started');
		}

		public useDebug(debug: boolean): Server {
			this.debug = debug;
			if(debug == true) {
				Logger.info('[Server]', 'Debug enabled');
			}
			return this;
		}

		private handleRequest(data: string): void {
			if(!Validator.isRequestPacket(data)) {
				return;
			}

			if(this.debug) {
				Logger.debug('[Server]', '[Request]', data);
			}

			let pkt = JSONRPC2.Model.ClientRequest.fromJson(data);

			if(pkt instanceof JSONRPC2.Model.Error) {
				this.sendResponse(pkt);
			}

			// execute
			let responsePromise: JQueryPromise<JSONRPC2.Model.ServerResponse> = this.executeRequest(<JSONRPC2.Model.ClientRequest>pkt);

			// determine the type
			if(pkt instanceof JSONRPC2.Model.Request) {
				responsePromise.always(function (pkt) {
					this.sendResponse(pkt);
				}.bind(this));
			}
		}

		private sendResponse(pkt: JSONRPC2.Model.ServerResponse) {
			if(this.debug) {
				Logger.debug('[Server]', '[Response]', pkt.toJson());
			}

			this.transport.send(pkt.toJson());
		}

		private executeRequest(req: ClientRequest): JQueryPromise<JSONRPC2.Model.ServerResponse> {
			let dfd: JQueryDeferred<JSONRPC2.Model.ServerResponse> = jQuery.Deferred();

			let tmp: Array<string> = req.getMethod().split(".", 2);

			let rcvrName: string = tmp[0];
			let rcvrFuncName: string = tmp[1];

			if(!(rcvrName in this.receivers)) {
				let err = JSONRPC2.ErrMethodNotFound;
				err.message = err.message.replace('{0}', req.getMethod());
				return dfd.reject(new JSONRPC2.Model.Error(err, req.getID()));
			}

			let rcvr: Receiver = this.receivers[rcvrName];
			let rcvrMethod = rcvr[rcvrFuncName];

			// async
			setTimeout(function () {
				if(typeof rcvrMethod === 'undefined') {
					let err = JSONRPC2.ErrMethodNotFound;
					err.message = err.message.replace('{0}', req.getMethod());
					dfd.reject(new JSONRPC2.Model.Error(err, req.getID()));
				}

				let rcvrResult: any;
				try {
					rcvrResult = rcvrMethod(req.getParams());
				} catch (e) {
					let err = ErrInternalError;
					if(e.message) {
						err = jQuery.extend(err, {data: {reason: e.message}});
					}
					dfd.reject(new JSONRPC2.Model.Error(err, req.getID()));
				}

				dfd.resolve(new JSONRPC2.Model.Response(rcvrResult, req.getID()));
			}.bind(this), 0);

			return dfd.promise();
		}

		public register(name: string, rcvr: Receiver) {
			this.receivers[name] = rcvr;
		}
	}
}
