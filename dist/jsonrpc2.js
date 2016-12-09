var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var JSONRPC2;
(function (JSONRPC2) {
    var Helper;
    (function (Helper) {
        var GUID = (function () {
            function GUID() {
            }
            GUID.generate = function () {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };
            return GUID;
        }());
        Helper.GUID = GUID;
    })(Helper = JSONRPC2.Helper || (JSONRPC2.Helper = {}));
})(JSONRPC2 || (JSONRPC2 = {}));
var JSONRPC2;
(function (JSONRPC2) {
    var Helper;
    (function (Helper) {
        var LoggerType;
        (function (LoggerType) {
            LoggerType[LoggerType["LOG"] = 0] = "LOG";
            LoggerType[LoggerType["DEBUG"] = 1] = "DEBUG";
            LoggerType[LoggerType["ERROR"] = 2] = "ERROR";
            LoggerType[LoggerType["INFO"] = 3] = "INFO";
            LoggerType[LoggerType["WARN"] = 4] = "WARN";
        })(LoggerType = Helper.LoggerType || (Helper.LoggerType = {}));
        var Logger = (function () {
            function Logger() {
            }
            Logger.log = function () {
                var messages = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    messages[_i] = arguments[_i];
                }
                Logger.write(LoggerType.LOG, messages);
            };
            Logger.debug = function () {
                var messages = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    messages[_i] = arguments[_i];
                }
                Logger.write(LoggerType.DEBUG, messages);
            };
            Logger.error = function () {
                var messages = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    messages[_i] = arguments[_i];
                }
                Logger.write(LoggerType.ERROR, messages);
            };
            Logger.info = function () {
                var messages = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    messages[_i] = arguments[_i];
                }
                Logger.write(LoggerType.INFO, messages);
            };
            Logger.warn = function () {
                var messages = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    messages[_i] = arguments[_i];
                }
                Logger.write(LoggerType.WARN, messages);
            };
            Logger.write = function (type, messages) {
                var date = Logger.getDate();
                messages.unshift('[' + date + ']');
                console[Logger.types[type]].apply(console, messages);
            };
            Logger.getDate = function () {
                var date = new Date();
                return [('0' + date.getDate()).slice(-2), ('0' + (date.getMonth() + 1)).slice(-2), date.getFullYear()].join('-') + ' ' + [('0' + date.getHours()).slice(-2), ('0' + date.getMinutes()).slice(-2), ('0' + date.getSeconds()).slice(-2)].join(':');
            };
            return Logger;
        }());
        Logger.types = ['log', 'debug', 'error', 'info', 'warn'];
        Helper.Logger = Logger;
    })(Helper = JSONRPC2.Helper || (JSONRPC2.Helper = {}));
})(JSONRPC2 || (JSONRPC2 = {}));
var JSONRPC2;
(function (JSONRPC2) {
    var Transport;
    (function (Transport) {
        var Logger = JSONRPC2.Helper.Logger;
        var HTTPConfig = (function () {
            function HTTPConfig() {
                this.headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                };
            }
            return HTTPConfig;
        }());
        Transport.HTTPConfig = HTTPConfig;
        var HTTP = (function () {
            function HTTP(config) {
                this.config = config;
            }
            HTTP.prototype.setup = function () {
            };
            HTTP.prototype.close = function () {
            };
            HTTP.prototype.send = function (request) {
                jQuery.ajax({
                    type: 'POST',
                    url: this.config.url,
                    dataType: 'text',
                    data: request,
                    headers: this.config.headers,
                    success: function (data, textStatus, jqXHR) {
                        this.handlers.forEach(function (handler) {
                            handler(data);
                        });
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        Logger.error('Error:', errorThrown, textStatus);
                    }
                });
            };
            HTTP.prototype.addHandler = function (callback) {
                this.handlers.push(callback);
            };
            ;
            return HTTP;
        }());
        Transport.HTTP = HTTP;
    })(Transport = JSONRPC2.Transport || (JSONRPC2.Transport = {}));
})(JSONRPC2 || (JSONRPC2 = {}));
var JSONRPC2;
(function (JSONRPC2) {
    var Transport;
    (function (Transport) {
        var Logger = JSONRPC2.Helper.Logger;
        var Websocket = (function () {
            function Websocket(config) {
                this.handlers = [];
                this.reconnectionAttempts = 0;
                this.timeout = 0;
                this.wasReached = false;
                this.isConnected = false;
                this.isConnecting = false;
                this.options = {
                    url: config.url,
                    alwaysReconnectOnClose: config.alwaysReconnectOnClose || false,
                    reconnectionInterval: config.reconnectionInterval || 1000,
                    maxReconnectionInterval: config.maxReconnectionInterval || 30000,
                    reconnectDecay: config.reconnectDecay || 2,
                    maxReconnectAttempts: config.maxReconnectAttempts || 0
                };
            }
            Websocket.prototype.setup = function () {
                if (this.isConnected || this.isConnecting) {
                    return;
                }
                this.connect();
            };
            Websocket.prototype.close = function () {
                this.socket.close(1000);
                this.wasReached = false;
            };
            Websocket.prototype.connect = function () {
                if (this.isConnected) {
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
            };
            Websocket.prototype.reconnect = function () {
                if (this.options.maxReconnectAttempts && this.reconnectionAttempts > this.options.maxReconnectAttempts) {
                    return;
                }
                if (this.options.maxReconnectAttempts) {
                    Logger.info('[Websocket]', 'Reconnecting (' + this.reconnectionAttempts + ' of ' + this.options.maxReconnectAttempts + ')...');
                }
                else {
                    Logger.info('[Websocket]', 'Reconnecting...');
                }
                this.connect();
            };
            Websocket.prototype.onOpen = function (ev) {
                Logger.info('[Websocket]', 'Connection established.');
                this.reconnectionAttempts = 0;
                this.timeout = 0;
                this.isConnecting = false;
                this.isConnected = true;
                if (!this.wasReached) {
                    this.wasReached = true;
                }
            };
            Websocket.prototype.onClose = function (ev) {
                this.isConnected = false;
                if (ev.wasClean && ev.code === 1000) {
                    Logger.info('[Websocket]', 'The connection has closed normally.', 'Code:', ev.code, 'Reason:', '"' + ev.reason + '"');
                    if (!this.options.alwaysReconnectOnClose) {
                        return;
                    }
                }
                else {
                    if (this.reconnectionAttempts == 0 && this.wasReached) {
                        Logger.info('[Websocket]', 'The connection has been lost.', 'Code:', ev.code, 'Reason:', '"' + ev.reason + '"');
                    }
                    else {
                        Logger.info('[Websocket]', 'The server cannot be reached.');
                    }
                }
                this.timeout = Math.floor(this.options.reconnectionInterval * Math.pow(this.options.reconnectDecay, this.reconnectionAttempts));
                setTimeout(function () {
                    this.reconnectionAttempts++;
                    this.reconnect();
                }.bind(this), this.timeout > this.options.maxReconnectionInterval ? this.options.maxReconnectionInterval : this.timeout);
            };
            Websocket.prototype.onError = function (ev) {
                Logger.error('[Websocket]', ev);
            };
            Websocket.prototype.onMessage = function (ev) {
                var data = ev.data;
                this.handlers.forEach(function (handler) {
                    handler(data);
                });
            };
            Websocket.prototype.isReady = function () {
                var dfd = jQuery.Deferred();
                var waitForState = function () {
                    if (this.isConnected && this.socket.readyState === WebSocket.OPEN) {
                        dfd.resolve(true);
                    }
                    else {
                        setTimeout(waitForState, 5);
                    }
                }.bind(this);
                waitForState();
                return dfd.promise();
            };
            Websocket.prototype.send = function (request) {
                this.isReady().then(function () {
                    this.socket.send(request);
                }.bind(this));
            };
            Websocket.prototype.addHandler = function (callback) {
                this.handlers.push(callback);
            };
            ;
            return Websocket;
        }());
        Transport.Websocket = Websocket;
    })(Transport = JSONRPC2.Transport || (JSONRPC2.Transport = {}));
})(JSONRPC2 || (JSONRPC2 = {}));
var JSONRPC2;
(function (JSONRPC2) {
    JSONRPC2.VERSION = "2.0";
    JSONRPC2.ErrParseError = { code: -32700, message: "Parse error" };
    JSONRPC2.ErrInvalidRequest = { code: -32600, message: "Invalid Request" };
    JSONRPC2.ErrMethodNotFound = { code: -32601, message: "Method \"{0}\" not found" };
    JSONRPC2.ErrInternalError = { code: -32603, message: "Internal error" };
})(JSONRPC2 || (JSONRPC2 = {}));
var JSONRPC2;
(function (JSONRPC2) {
    var Logger = JSONRPC2.Helper.Logger;
    var Client = (function () {
        function Client(transport) {
            this.transport = transport;
            this.promises = [];
            this.debug = false;
            this.transport.addHandler(this.handleResponse.bind(this));
            this.transport.setup();
        }
        Client.prototype.useDebug = function (debug) {
            this.debug = debug;
            if (debug == true) {
                Logger.info('[Client]', 'Debug enabled');
            }
            return this;
        };
        Client.prototype.execute = function (req) {
            var dfd = jQuery.Deferred();
            var data = req.toJson();
            if (this.debug) {
                Logger.debug('[Client]', '[Request]', data);
            }
            this.promises.push([req.getID(), dfd]);
            this.transport.send(data);
            return dfd.promise();
        };
        Client.prototype.handleResponse = function (data) {
            if (!JSONRPC2.Validator.isResponsePacket(data)) {
                return;
            }
            if (this.debug) {
                Logger.debug("[Client]", "[Response]", data);
            }
            var res = JSONRPC2.Model.ServerResponse.fromJson(data);
            var resolve = true;
            if (res instanceof JSONRPC2.Model.Error) {
                resolve = false;
                if (res.getCode() === JSONRPC2.ErrParseError.code) {
                    Logger.error("Parse error:", data);
                    return;
                }
                if (res.getCode() === JSONRPC2.ErrInvalidRequest.code) {
                    Logger.error("Invalid Request:", data);
                    return;
                }
            }
            for (var i = 0; i < this.promises.length; ++i) {
                if (this.promises[i][0] === res.getID()) {
                    if (resolve) {
                        this.promises[i][1].resolve(res.getResult());
                    }
                    else {
                        this.promises[i][1].reject(res.getError());
                    }
                    this.promises.splice(i, 1);
                    break;
                }
            }
        };
        Client.prototype.closeConnection = function () {
            this.transport.close();
        };
        return Client;
    }());
    JSONRPC2.Client = Client;
})(JSONRPC2 || (JSONRPC2 = {}));
var JSONRPC2;
(function (JSONRPC2) {
    var Logger = JSONRPC2.Helper.Logger;
    var Server = (function () {
        function Server(transport) {
            this.receivers = {};
            this.debug = false;
            this.transport = transport;
            this.transport.addHandler(this.handleRequest.bind(this));
            this.transport.setup();
            Logger.info('[Server]', 'Server is started');
        }
        Server.prototype.useDebug = function (debug) {
            this.debug = debug;
            if (debug == true) {
                Logger.info('[Server]', 'Debug enabled');
            }
            return this;
        };
        Server.prototype.handleRequest = function (data) {
            if (!JSONRPC2.Validator.isRequestPacket(data)) {
                return;
            }
            if (this.debug) {
                Logger.debug('[Server]', '[Request]', data);
            }
            var pkt = JSONRPC2.Model.ClientRequest.fromJson(data);
            if (pkt instanceof JSONRPC2.Model.Error) {
                this.sendResponse(pkt);
            }
            var responsePromise = this.executeRequest(pkt);
            if (pkt instanceof JSONRPC2.Model.ClientRequest) {
                responsePromise.always(function (pkt) {
                    this.sendResponse(pkt);
                }.bind(this));
            }
        };
        Server.prototype.sendResponse = function (pkt) {
            if (this.debug) {
                Logger.debug('[Server]', '[Response]', pkt.toJson());
            }
            this.transport.send(pkt.toJson());
        };
        Server.prototype.executeRequest = function (req) {
            var dfd = jQuery.Deferred();
            var tmp = req.getMethod().split(".", 2);
            var rcvrName = tmp[0];
            var rcvrFuncName = tmp[1];
            if (!(rcvrName in this.receivers)) {
                var err = JSONRPC2.ErrMethodNotFound;
                err.message = err.message.replace('{0}', req.getMethod());
                dfd.reject(new JSONRPC2.Model.Error(err, req.getID()));
            }
            var rcvr = this.receivers[rcvrName];
            var rcvrMethod = rcvr[rcvrFuncName];
            setTimeout(function () {
                if (typeof rcvrMethod === 'undefined') {
                    var err = JSONRPC2.ErrMethodNotFound;
                    err.message = err.message.replace('{0}', req.getMethod());
                    dfd.reject(new JSONRPC2.Model.Error(err, req.getID()));
                }
                var rcvrResult;
                try {
                    rcvrResult = rcvrMethod(req.getParams());
                }
                catch (e) {
                    var err = JSONRPC2.ErrInternalError;
                    if (e.message) {
                        err = jQuery.extend(err, { data: { reason: e.message } });
                    }
                    dfd.reject(new JSONRPC2.Model.Error(err, req.getID()));
                }
                dfd.resolve(new JSONRPC2.Model.Response(rcvrResult, req.getID()));
            }.bind(this), 0);
            return dfd.promise();
        };
        Server.prototype.register = function (name, rcvr) {
            this.receivers[name] = rcvr;
        };
        return Server;
    }());
    JSONRPC2.Server = Server;
})(JSONRPC2 || (JSONRPC2 = {}));
var JSONRPC2;
(function (JSONRPC2) {
    var Validator = (function () {
        function Validator() {
        }
        Validator.isRequestPacket = function (data) {
            return data.indexOf('"method":') > 0;
        };
        Validator.isResponsePacket = function (data) {
            return data.indexOf('"result":') > 0 || data.indexOf('"error":') > 0;
        };
        Validator.tryParseJSON = function (data) {
            var json;
            try {
                json = JSON.parse(data);
            }
            catch (e) {
                return { valid: false };
            }
            return { json: json, valid: true };
        };
        return Validator;
    }());
    JSONRPC2.Validator = Validator;
})(JSONRPC2 || (JSONRPC2 = {}));
var JSONRPC2;
(function (JSONRPC2) {
    var Model;
    (function (Model) {
        var Logger = JSONRPC2.Helper.Logger;
        var ServerResponse = (function () {
            function ServerResponse() {
                this.jsonrpc = JSONRPC2.VERSION;
            }
            ServerResponse.fromJson = function (json) {
                var result = JSONRPC2.Validator.tryParseJSON(json);
                var pkt;
                if (!result.valid) {
                    Logger.error("Not a valid JSON response is gotten");
                    return new Model.Error(JSONRPC2.ErrParseError, null);
                }
                else {
                    pkt = result.json;
                }
                if (!('jsonrpc' in pkt) || pkt.jsonrpc != JSONRPC2.VERSION) {
                    return new Model.Error(JSONRPC2.ErrInvalidRequest, null);
                }
                if ('result' in pkt) {
                    return new Model.Response(pkt.result, pkt.id);
                }
                else if ('error' in pkt) {
                    return new Model.Error(pkt.error, pkt.id);
                }
            };
            ServerResponse.prototype.toJson = function () {
                var pkt = jQuery.extend(true, {}, this);
                if (this.id == undefined) {
                    delete pkt['id'];
                }
                if (this.error == undefined) {
                    delete pkt['error'];
                }
                if (this.result == undefined) {
                    delete pkt['result'];
                }
                return JSON.stringify(pkt);
            };
            ServerResponse.prototype.getID = function () {
                return this.id;
            };
            ServerResponse.prototype.getResult = function () {
                return this.result;
            };
            ServerResponse.prototype.getError = function () {
                return this.error;
            };
            return ServerResponse;
        }());
        Model.ServerResponse = ServerResponse;
    })(Model = JSONRPC2.Model || (JSONRPC2.Model = {}));
})(JSONRPC2 || (JSONRPC2 = {}));
var JSONRPC2;
(function (JSONRPC2) {
    var Model;
    (function (Model) {
        var Logger = JSONRPC2.Helper.Logger;
        var ClientRequest = (function () {
            function ClientRequest(method, params, id) {
                this.jsonrpc = JSONRPC2.VERSION;
                this.method = method;
                this.params = params;
                this.id = id;
            }
            ClientRequest.prototype.toJson = function () {
                var pkt = jQuery.extend(true, {}, this);
                if (this.id == undefined) {
                    delete pkt['id'];
                }
                if (this.params == undefined) {
                    delete pkt['params'];
                }
                return JSON.stringify(pkt);
            };
            ClientRequest.fromJson = function (json) {
                var result = JSONRPC2.Validator.tryParseJSON(json);
                if (!result.valid) {
                    Logger.error("Not a valid JSON request is gotten");
                    return new Model.Error(JSONRPC2.ErrParseError, null);
                }
                var pkt = result.json;
                if (!('jsonrpc' in pkt) || pkt.jsonrpc != JSONRPC2.VERSION) {
                    return new Model.Error(JSONRPC2.ErrInvalidRequest, null);
                }
                if ('id' in pkt) {
                    return new ClientRequest(pkt.method, pkt.params, pkt.id);
                }
                else {
                    return new Model.Notification(pkt.method, pkt.params);
                }
            };
            ClientRequest.prototype.send = function (c) {
                return c.execute(this);
            };
            ClientRequest.prototype.getID = function () {
                return this.id;
            };
            ClientRequest.prototype.getMethod = function () {
                return this.method;
            };
            ClientRequest.prototype.getParams = function () {
                return this.params;
            };
            return ClientRequest;
        }());
        Model.ClientRequest = ClientRequest;
    })(Model = JSONRPC2.Model || (JSONRPC2.Model = {}));
})(JSONRPC2 || (JSONRPC2 = {}));
var JSONRPC2;
(function (JSONRPC2) {
    var Model;
    (function (Model) {
        var GUID = JSONRPC2.Helper.GUID;
        var Request = (function (_super) {
            __extends(Request, _super);
            function Request(method, params) {
                var _this = _super.call(this, method, params) || this;
                _this.id = GUID.generate();
                return _this;
            }
            return Request;
        }(Model.ClientRequest));
        Model.Request = Request;
    })(Model = JSONRPC2.Model || (JSONRPC2.Model = {}));
})(JSONRPC2 || (JSONRPC2 = {}));
var JSONRPC2;
(function (JSONRPC2) {
    var Model;
    (function (Model) {
        var Notification = (function (_super) {
            __extends(Notification, _super);
            function Notification(method, params) {
                var _this = _super.call(this, method, params) || this;
                _this.id = undefined;
                return _this;
            }
            Notification.prototype.send = function (c) {
                return _super.prototype.send.call(this, c);
            };
            return Notification;
        }(Model.ClientRequest));
        Model.Notification = Notification;
    })(Model = JSONRPC2.Model || (JSONRPC2.Model = {}));
})(JSONRPC2 || (JSONRPC2 = {}));
var JSONRPC2;
(function (JSONRPC2) {
    var Model;
    (function (Model) {
        var Response = (function (_super) {
            __extends(Response, _super);
            function Response(result, id) {
                var _this = _super.call(this) || this;
                _this.result = result;
                _this.id = id;
                return _this;
            }
            Response.prototype.getResult = function () {
                return this.result;
            };
            return Response;
        }(Model.ServerResponse));
        Model.Response = Response;
    })(Model = JSONRPC2.Model || (JSONRPC2.Model = {}));
})(JSONRPC2 || (JSONRPC2 = {}));
var JSONRPC2;
(function (JSONRPC2) {
    var Model;
    (function (Model) {
        var Error = (function (_super) {
            __extends(Error, _super);
            function Error(error, id) {
                var _this = _super.call(this) || this;
                _this.error = error;
                _this.id = id;
                return _this;
            }
            Error.prototype.getCode = function () {
                return this.error.code;
            };
            Error.prototype.getMessage = function () {
                return this.error.message;
            };
            Error.prototype.getData = function () {
                return this.error.data || {};
            };
            return Error;
        }(Model.ServerResponse));
        Model.Error = Error;
    })(Model = JSONRPC2.Model || (JSONRPC2.Model = {}));
})(JSONRPC2 || (JSONRPC2 = {}));
