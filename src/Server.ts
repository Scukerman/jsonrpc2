namespace JSONRPC2 {
    export interface Receiver {
        [methodName: string]: (params: { [paramName: string]: any; }) => any;
    }

    export class Server {
        private receivers: { [key: string]: Receiver };

        constructor() {
            this.receivers = {};
        }

        public handleJSON(json: string|{[key: string]: any;}) {
            let packet: {[key: string]: any;};
            if(typeof json === 'string') {
                packet = JSON.parse(<string>json);
            }

            if(!('jsonrpc' in packet) || packet['jsonrpc'] != '2.0') {
               // return new JSONRPC2.Model.Error()
            }

            let pkt: JSONRPC2.Model.Request|JSONRPC2.Model.Notification;
            if('id' in packet) {
                pkt = new JSONRPC2.Model.Request(packet['method'], packet['params'] || {}, packet['id']);
            } else {
                pkt = new JSONRPC2.Model.Notification(packet['method'], packet['params'] || {})
            }

            return this.handle(pkt);
        }

        public handle(pkt: JSONRPC2.Model.Request|JSONRPC2.Model.Notification): void|JSONRPC2.Model.Response|JSONRPC2.Model.Error {

            let tmp: Array<string> = pkt.method.split(".", 2);

            let rcvrName: string = tmp[0];
            let rcvrFuncName: string = tmp[1];

            if(!(rcvrName in this.receivers)) {
                return new JSONRPC2.Model.Error((<JSONRPC2.Model.Request>pkt).getID(), -32601, JSONRPC2.ERROR_CODES['-32601'])
            }

            let rcvr: Receiver = this.receivers[rcvrName];
            let rcvrMethod = rcvr[rcvrFuncName];
            let rcvrResult: any = rcvrMethod(pkt.params);

            return new JSONRPC2.Model.Response((<JSONRPC2.Model.Request>pkt).getID(), rcvrResult);
        }

        public handleNotification(ntf: JSONRPC2.Model.Notification) {

        }

        public handleRequest(req: JSONRPC2.Model.Request): JSONRPC2.Model.Response {
            let tmp: Array<string> = req.method.split(".", 2);

            let rcvrName: string = tmp[0];
            let rcvrFuncName: string = tmp[1];

            let rcvr: Receiver = this.receivers[rcvrName];
            let rcvrMethod = rcvr[rcvrFuncName];
            let rcvrResult: any = rcvrMethod(req.params);
            return new JSONRPC2.Model.Response(req.getID(), rcvrResult);
        }

        public register(name: string, rcvr: Receiver) {
            this.receivers[name] = rcvr;
        }
    }
}
