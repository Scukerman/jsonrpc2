/// <reference path="../typings/tsd.d.ts" />
namespace JSONRPC2 {
    export var VERSION: string = "2.0";
    export var ERROR_CODES = {
        "-32700": "Parse error",
        "-32600": "Invalid Request",
        "-32601": "Method not found",
        "-32602": "Invalid params",
        "-32603": "Internal error",
        "-32000": "Server error"
    };
}
