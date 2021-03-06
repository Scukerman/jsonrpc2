/// <reference path="../typings/index.d.ts" />
namespace JSONRPC2 {
	export interface ErrorInterface {
		code: number;
		message: string;
		data?: any;
	}

	export const VERSION: string = "2.0";

	export const ErrParseError: ErrorInterface = {code: -32700, message: "Parse error"};
	export const ErrInvalidRequest: ErrorInterface = {code: -32600, message: "Invalid Request"};
	export const ErrMethodNotFound: ErrorInterface = {code: -32601, message: "Method \"{0}\" not found"};
	export const ErrInternalError: ErrorInterface = {code: -32603, message: "Internal error"};

}

// Here we expose the TypeScript services as an external module
// so that it may be consumed easily like a node module.
declare var module: any;
if (typeof module !== "undefined" && module.exports) {
	module.exports = JSONRPC2;
}