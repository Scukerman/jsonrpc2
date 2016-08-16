namespace JSONRPC2 {
	export namespace Transport {
		export interface Transport {
			setup(): void;
			close(): void;
			send(request: string): void;
			addHandler(callback: (data: string) => any): void;
		}
	}
}