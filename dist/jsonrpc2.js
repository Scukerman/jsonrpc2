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
        (function (LoggerType) {
            LoggerType[LoggerType["LOG"] = 0] = "LOG";
            LoggerType[LoggerType["DEBUG"] = 1] = "DEBUG";
            LoggerType[LoggerType["ERROR"] = 2] = "ERROR";
            LoggerType[LoggerType["INFO"] = 3] = "INFO";
            LoggerType[LoggerType["WARN"] = 4] = "WARN";
        })(Helper.LoggerType || (Helper.LoggerType = {}));
        var LoggerType = Helper.LoggerType;
        var Logger = (function () {
            function Logger() {
            }
            Logger.log = function () {
                var messages = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    messages[_i - 0] = arguments[_i];
                }
                Logger.write(LoggerType.LOG, messages);
            };
            Logger.debug = function () {
                var messages = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    messages[_i - 0] = arguments[_i];
                }
                Logger.write(LoggerType.DEBUG, messages);
            };
            Logger.error = function () {
                var messages = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    messages[_i - 0] = arguments[_i];
                }
                Logger.write(LoggerType.ERROR, messages);
            };
            Logger.info = function () {
                var messages = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    messages[_i - 0] = arguments[_i];
                }
                Logger.write(LoggerType.INFO, messages);
            };
            Logger.warn = function () {
                var messages = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    messages[_i - 0] = arguments[_i];
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
            Logger.types = ['log', 'debug', 'error', 'info', 'warn'];
            return Logger;
        }());
        Helper.Logger = Logger;
    })(Helper = JSONRPC2.Helper || (JSONRPC2.Helper = {}));
})(JSONRPC2 || (JSONRPC2 = {}));
var JSONRPC2;
(function (JSONRPC2) {
    var Transport;
    (function (Transport) {
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
            HTTP.prototype.initiate = function () {
            };
            HTTP.prototype.doRequest = function (req) {
                var dfd = jQuery.Deferred();
                JSONRPC2.Helper.Logger.debug("==>", req.toJson());
                jQuery.ajax({
                    type: 'POST',
                    url: this.config.url,
                    dataType: 'text',
                    data: req.toJson(),
                    headers: this.config.headers,
                    success: function (data, textStatus, jqXHR) {
                        JSONRPC2.Helper.Logger.debug("<==", data);
                        if (data == undefined) {
                            return dfd.resolve(data);
                        }
                        var res = JSONRPC2.Model.ServerResponse.fromJson(data);
                        dfd.resolve(res);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log("server error:", errorThrown, textStatus);
                    }
                });
                return dfd.promise();
            };
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
                this.promises = [];
                this.reconnectionAttempts = 0;
                this.timeout = 0;
                this.wasReached = false;
                this.options = {
                    url: config.url,
                    reconnectionInterval: config.reconnectionInterval || 1000,
                    maxReconnectionInterval: config.maxReconnectionInterval || 30000,
                    reconnectDecay: config.reconnectDecay || 2,
                    maxReconnectAttempts: config.maxReconnectAttempts || 0
                };
            }
            Websocket.prototype.initiate = function () {
                this.connect();
            };
            Websocket.prototype.connect = function () {
                Logger.info("Connecting to", this.options.url);
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
                    Logger.info('Reconnecting (' + this.reconnectionAttempts + ' of ' + this.options.maxReconnectAttempts + ')...');
                }
                else {
                    Logger.debug("Reconnecting...");
                }
                this.connect();
            };
            Websocket.prototype.onOpen = function (ev) {
                Logger.info("Connection established");
                this.reconnectionAttempts = 0;
                this.timeout = 0;
                if (!this.wasReached) {
                    this.wasReached = true;
                }
            };
            Websocket.prototype.onClose = function (ev) {
                if (ev.wasClean) {
                    Logger.info("The connection has been closed by server.");
                }
                else {
                    if (this.reconnectionAttempts == 0 && this.wasReached) {
                        Logger.info("The connection has been lost.");
                    }
                    else {
                        Logger.info("The server cannot be reached.");
                    }
                    this.timeout = Math.floor(this.options.reconnectionInterval * Math.pow(this.options.reconnectDecay, this.reconnectionAttempts));
                    Logger.debug("timeout:", this.timeout);
                    Logger.debug("reconnectAttempts:", this.reconnectionAttempts);
                    setTimeout(function () {
                        this.reconnectionAttempts++;
                        this.reconnect();
                    }.bind(this), this.timeout > this.options.maxReconnectionInterval ? this.options.maxReconnectionInterval : this.timeout);
                }
            };
            Websocket.prototype.onError = function (ev) {
                Logger.error(ev);
            };
            Websocket.prototype.onMessage = function (ev) {
                var res = JSONRPC2.Model.ServerResponse.fromJson(ev.data);
                for (var i = 0; i < this.promises.length; ++i) {
                    if (this.promises[i][0] === res.getID()) {
                        Logger.debug("<==", ev.data);
                        if (res instanceof JSONRPC2.Model.Error) {
                            this.promises[i][1].reject(res);
                        }
                        else {
                            this.promises[i][1].resolve(res);
                        }
                        this.promises.splice(i, 1);
                        return;
                    }
                }
            };
            Websocket.prototype.isReady = function () {
                var dfd = jQuery.Deferred();
                var waitForState = function () {
                    if (this.socket.readyState === WebSocket.OPEN) {
                        dfd.resolve(true);
                    }
                    else {
                        setTimeout(waitForState, 5);
                    }
                }.bind(this);
                waitForState();
                return dfd.promise();
            };
            Websocket.prototype.doRequest = function (req) {
                var dfd = jQuery.Deferred();
                this.isReady().then(function () {
                    Logger.debug("==>", req.toJson());
                    this.socket.send(req.toJson());
                }.bind(this));
                this.promises.push([req.getID(), dfd]);
                return dfd.promise();
            };
            return Websocket;
        }());
        Transport.Websocket = Websocket;
    })(Transport = JSONRPC2.Transport || (JSONRPC2.Transport = {}));
})(JSONRPC2 || (JSONRPC2 = {}));
var JSONRPC2;
(function (JSONRPC2) {
    JSONRPC2.VERSION = "2.0";
    JSONRPC2.ERROR_CODES = {
        "-32700": "Parse error",
        "-32600": "Invalid Request",
        "-32601": "Method not found",
        "-32602": "Invalid params",
        "-32603": "Internal error",
        "-32000": "Server error"
    };
})(JSONRPC2 || (JSONRPC2 = {}));
var JSONRPC2;
(function (JSONRPC2) {
    var Client = (function () {
        function Client(transport) {
            this.transport = transport;
            transport.initiate();
        }
        Client.prototype.execute = function (req) {
            return this.transport.doRequest(req);
        };
        return Client;
    }());
    JSONRPC2.Client = Client;
})(JSONRPC2 || (JSONRPC2 = {}));
var JSONRPC2;
(function (JSONRPC2) {
    var Model;
    (function (Model) {
        var ServerResponse = (function () {
            function ServerResponse() {
            }
            ServerResponse.fromJson = function (json) {
                var res = JSON.parse(json);
                if ('result' in res) {
                    return new Model.Response(res.result, res.id);
                }
                else if ('error' in res) {
                    return new Model.Error(res.error, res.id);
                }
            };
            ServerResponse.prototype.getID = function () {
                return this.id;
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
        var ClientRequest = (function () {
            function ClientRequest(method, params, id) {
                this.jsonrpc = JSONRPC2.VERSION;
                this.method = method;
                this.params = params;
                this.id = id;
            }
            ClientRequest.prototype.toJson = function () {
                var pkt = this;
                if (this.params == undefined) {
                    pkt = jQuery.extend(true, {}, this);
                    delete pkt['params'];
                }
                return JSON.stringify(pkt);
            };
            ClientRequest.prototype.send = function (c) {
                return c.execute(this);
            };
            ClientRequest.prototype.getID = function () {
                return this.id;
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
        var Request = (function (_super) {
            __extends(Request, _super);
            function Request(method, params) {
                _super.call(this, method, params);
                this.id = JSONRPC2.Helper.GUID.generate();
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
                _super.call(this, method, params);
                this.id = undefined;
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
                _super.call(this);
                this.result = result;
                this.id = id;
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
                _super.call(this);
                this.error = error;
                this.id = id;
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
