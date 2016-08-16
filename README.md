# jsonrpc2
JSON-RPC 2.0 Server &amp; Client for Browser with Transport interfaces.

```sh
$ npm install
$ tsd
$ tsc
$ gulp
```

*Example of usage:*
```javascript
var transport = new JSONRPC2.Transport.Websocket({
	url: "ws://localhost:3000/ws"
});

var client = new JSONRPC2.Client(transport);

var req = new JSONRPC2.Model.Request("Test.Test1", {A: 10, B: 30});
req.send(client).then(function(res) {
	console.log("res:", res);
}, function(err) {
	console.log("err:", err);
});
```

```javascript
var transport = new JSONRPC2.Transport.Websocket({
	url: "ws://localhost:3000/ws"
});

var s = new JSONRPC2.Server(transport).useDebug(true);
s.register('Test', {
	'Me': function(params) {
		return "hello, world!"
	},
	'Test1': function(params) {
		return params.A + params.B;
	}
});
```
