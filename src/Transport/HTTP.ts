namespace JSONRPC2 {
	export namespace Transport {
		export class HTTPConfig {
			public url: string;
			public headers: { [key: string]: any; } = {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			};
		}

		export class HTTP implements Transport {
			public config: HTTPConfig;

			constructor(config: HTTPConfig) {
				this.config = config;
			}

			public setup() {}

			close() {}

			public doRequest(req: JSONRPC2.Model.ClientRequest): JQueryPromise<JSONRPC2.Model.ServerResponse> {
				let dfd: JQueryDeferred<JSONRPC2.Model.ServerResponse> = jQuery.Deferred();
				JSONRPC2.Helper.Logger.debug("==>", req.toJson());

				jQuery.ajax({
					type: 'POST',
					url: this.config.url,
					dataType: 'text',
					data: req.toJson(),
					headers: this.config.headers,
					success: function(data: any, textStatus: string, jqXHR: JQueryXHR): any {
						JSONRPC2.Helper.Logger.debug("<==", data);

						if(data == undefined) {
							return dfd.resolve(data);
						}

						let res = JSONRPC2.Model.ServerResponse.fromJson(data);
						dfd.resolve(res);
					},
					error: function (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) {
						console.log("server error:", errorThrown, textStatus);
					}
				});

				return dfd.promise();
			}
		}
	}
}