namespace JSONRPC2 {
	export namespace Transport {
		import Logger = JSONRPC2.Helper.Logger;

		export interface WebsocketConfig {
			url: string,
			reconnectionInterval?: number,
			maxReconnectionInterval?: number,
			reconnectDecay?: number,
			maxReconnectAttempts?: number
		}

		export class Websocket implements Transport {
			private socket: WebSocket;
			private promises: [string|number, JQueryDeferred<JSONRPC2.Model.ServerResponse>][] = [];
			private options: WebsocketConfig;

			private reconnectionAttempts: number = 0;
			private timeout: number = 0;
			private wasReached: boolean = false;

			constructor(config: WebsocketConfig) {
				this.options = {
					url: config.url,
					reconnectionInterval: config.reconnectionInterval || 1000,
					maxReconnectionInterval: config.maxReconnectionInterval || 30000,
					reconnectDecay: config.reconnectDecay || 2,
					maxReconnectAttempts: config.maxReconnectAttempts || 0
				};
			}

			public initiate() {
				this.connect();
			}

			private connect() {
				Logger.info("Connecting to", this.options.url);
				this.socket = new WebSocket(this.options.url);
				this.socket.addEventListener("open", this.onOpen.bind(this));
				this.socket.addEventListener("close", this.onClose.bind(this));
				this.socket.addEventListener("error", this.onError.bind(this));
				this.socket.addEventListener("message", this.onMessage.bind(this));
			}

			private reconnect() {
				if(this.options.maxReconnectAttempts && this.reconnectionAttempts > this.options.maxReconnectAttempts) {
					return;
				}

				if(this.options.maxReconnectAttempts) {
					Logger.info('Reconnecting (' + this.reconnectionAttempts + ' of ' + this.options.maxReconnectAttempts + ')...');
				} else {
					Logger.debug("Reconnecting...");
				}
				this.connect();
			}

			private onOpen(ev: Event): void {
				Logger.info("Connection established");
				this.reconnectionAttempts = 0;
				this.timeout = 0;
				if(!this.wasReached) {
					this.wasReached = true;
				}
			}

			private onClose(ev: CloseEvent): void {
				if(ev.wasClean) {
					Logger.info("The connection has been closed by server.");
				} else {
					if(this.reconnectionAttempts == 0 && this.wasReached) {
						Logger.info("The connection has been lost.");
					} else {
						Logger.info("The server cannot be reached.");
					}


					this.timeout = Math.floor(this.options.reconnectionInterval * Math.pow(this.options.reconnectDecay, this.reconnectionAttempts));
					Logger.debug("timeout:", this.timeout);
					Logger.debug("reconnectAttempts:", this.reconnectionAttempts);

					setTimeout(function() {
						this.reconnectionAttempts++;
						this.reconnect();
					}.bind(this), this.timeout > this.options.maxReconnectionInterval ? this.options.maxReconnectionInterval : this.timeout);
				}
			}

			private onError(ev: ErrorEvent): void {
				Logger.error(ev);
			}

			private onMessage(ev: MessageEvent): void {
				let res = JSONRPC2.Model.ServerResponse.fromJson(ev.data);

				for(var i = 0; i < this.promises.length; ++i) {
					if(this.promises[i][0] === res.getID()) {
						Logger.debug("<==", ev.data);

						if(res instanceof JSONRPC2.Model.Error) {
							this.promises[i][1].reject(res);
						} else {
							this.promises[i][1].resolve(res);
						}

						this.promises.splice(i, 1);
						return;
					}
				}
			}

			private isReady() {
				let dfd: JQueryDeferred<boolean> = jQuery.Deferred();

				let waitForState = function() {
					if(this.socket.readyState === WebSocket.OPEN) {
						dfd.resolve(true);
					} else {
						setTimeout(waitForState, 5);
					}
				}.bind(this);

				waitForState();

				return dfd.promise();
			}

			public doRequest(req:JSONRPC2.Model.ClientRequest): JQueryPromise<JSONRPC2.Model.ServerResponse> {
				let dfd: JQueryDeferred<JSONRPC2.Model.ServerResponse> = jQuery.Deferred();

				this.isReady().then(function() {
					Logger.debug("==>", req.toJson());
					this.socket.send(req.toJson());
				}.bind(this));

				this.promises.push([req.getID(), dfd]);

				return dfd.promise();
			}
		}
	}
}
