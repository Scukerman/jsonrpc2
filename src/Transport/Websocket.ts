namespace JSONRPC2 {
	export namespace Transport {
		import Logger = JSONRPC2.Helper.Logger;
		import GUID = JSONRPC2.Helper.GUID;

		export interface WebsocketConfig {
			url: string,
			alwaysReconnectOnClose?: boolean,
			reconnectionInterval?: number,
			maxReconnectionInterval?: number,
			reconnectDecay?: number,
			maxReconnectAttempts?: number,
			onOpenHandler?: () => any
		}

		export class Websocket implements Transport {
			private socket: WebSocket;
			private handlers: ((data: string) => any)[] = [];
			private options: WebsocketConfig;

			private reconnectionAttempts: number = 0;
			private timeout: number = 0;
			private wasReached: boolean = false;
			private isConnected: boolean = false;
			private isConnecting: boolean = false;

			constructor(config: WebsocketConfig) {
				this.options = {
					url: config.url,
					alwaysReconnectOnClose: config.alwaysReconnectOnClose || false,
					reconnectionInterval: config.reconnectionInterval || 1000,
					maxReconnectionInterval: config.maxReconnectionInterval || 30000,
					reconnectDecay: config.reconnectDecay || 2,
					maxReconnectAttempts: config.maxReconnectAttempts || 0,
					onOpenHandler: config.onOpenHandler || null
				};
			}

			public setup(): void {
				if(this.isConnected || this.isConnecting) {
					return;
				}
				this.connect();
			}

			public close(): void {
				this.socket.close(1000);
				this.wasReached = false;
			}

			private connect() {
				if(this.isConnected) {
					Logger.warn('[Websocket]', 'Connection had been already established.');
					return;
				}
				Logger.info('[Websocket]', 'Connecting to', this.options.url);
				this.isConnecting = true;
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
					Logger.info('[Websocket]', 'Reconnecting (' + this.reconnectionAttempts + ' of ' + this.options.maxReconnectAttempts + ')...');
				} else {
					Logger.info('[Websocket]', 'Reconnecting...');
				}
				this.connect();
			}

			private onOpen(ev: Event): void {
				Logger.info('[Websocket]', 'Connection established.');
				this.reconnectionAttempts = 0;
				this.timeout = 0;
				this.isConnecting = false;
				this.isConnected = true;
				if(!this.wasReached) {
					this.wasReached = true;
				}

				this.options.onOpenHandler && this.options.onOpenHandler();
			}

			private onClose(ev: CloseEvent): void {
				this.isConnected = false;

				if(ev.wasClean && ev.code === 1000) {
					Logger.info('[Websocket]', 'The connection has closed normally.', 'Code:', ev.code, 'Reason:', '"' + ev.reason + '"');
					if(!this.options.alwaysReconnectOnClose) {
						return;
					}
				} else {
					if(this.reconnectionAttempts == 0 && this.wasReached) {
						Logger.info('[Websocket]', 'The connection has been lost.', 'Code:', ev.code, 'Reason:', '"' + ev.reason + '"');
					} else {
						Logger.info('[Websocket]', 'The server cannot be reached.');
					}
				}

				this.timeout = Math.floor(this.options.reconnectionInterval * Math.pow(this.options.reconnectDecay, this.reconnectionAttempts));

				setTimeout(function () {
					this.reconnectionAttempts++;
					this.reconnect();
				}.bind(this), this.timeout > this.options.maxReconnectionInterval ? this.options.maxReconnectionInterval : this.timeout);
			}

			private onError(ev: ErrorEvent): void {
				Logger.error('[Websocket]', ev);
			}

			private onMessage(ev: MessageEvent): void {
				let data: string = ev.data;

				this.handlers.forEach(function (handler: (data: string) => any) {
					handler(data);
				});
			}

			private isReady(): JQueryPromise<boolean> {
				let dfd: JQueryDeferred<boolean> = jQuery.Deferred();

				let waitForState = function () {
					if(this.isConnected && this.socket.readyState === WebSocket.OPEN) {
						dfd.resolve(true);
					} else {
						setTimeout(waitForState, 5);
					}
				}.bind(this);

				waitForState();

				return dfd.promise();
			}

			public send(request: string): void {
				this.isReady().then(function () {
					this.socket.send(request);
				}.bind(this));
			}

			public addHandler(callback: (data: string) => any): void {
				this.handlers.push(callback);
			};
		}
	}
}
