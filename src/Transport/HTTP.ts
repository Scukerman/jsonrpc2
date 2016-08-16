namespace JSONRPC2 {
	export namespace Transport {
		import Logger = JSONRPC2.Helper.Logger;
		export class HTTPConfig {
			public url: string;
			public headers: { [key: string]: any; } = {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			};
		}

		export class HTTP implements Transport {
			public config: HTTPConfig;
			private handlers: ((data: string) => any)[];

			constructor(config: HTTPConfig) {
				this.config = config;
			}

			public setup(): void {
			}

			public close(): void {
			}

			public send(request: string): void {
				jQuery.ajax({
					type: 'POST',
					url: this.config.url,
					dataType: 'text',
					data: request,
					headers: this.config.headers,
					success: function (data: any, textStatus: string, jqXHR: JQueryXHR): any {
						this.handlers.forEach(function (handler: (data: string) => any) {
							handler(data);
						});
					},
					error: function (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) {
						Logger.error('Error:', errorThrown, textStatus);
					}
				});
			}

			public addHandler(callback: (data: string) => any): void {
				this.handlers.push(callback);
			};
		}
	}
}