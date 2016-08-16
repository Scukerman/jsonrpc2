/// <reference path="../typings/tsd.d.ts" />
namespace JSONRPC2 {
	export interface ErrorInterface {
		code: number;
		message: string;
		data?: any;
	}

	export const VERSION: string = "2.0";

	export const ErrParseError: ErrorInterface = {code: -32700, message: "Parse error"};
	export const ErrInvalidRequest: ErrorInterface = {code: -32600, message: "Invalid Request"};
	export const ErrMethodNotFound: ErrorInterface = {code: -32601, message: "Method not found"};
	export const ErrInternalError: ErrorInterface = {code: -32603, message: "Internal error"};

}
