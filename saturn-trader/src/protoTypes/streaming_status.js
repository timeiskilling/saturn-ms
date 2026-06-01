/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars, default-case, jsdoc/require-param*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.streaming = (function() {

    /**
     * Namespace streaming.
     * @exports streaming
     * @namespace
     */
    var streaming = {};

    streaming.BundleService = (function() {

        /**
         * Constructs a new BundleService service.
         * @memberof streaming
         * @classdesc Represents a BundleService
         * @extends $protobuf.rpc.Service
         * @constructor
         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
         */
        function BundleService(rpcImpl, requestDelimited, responseDelimited) {
            $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
        }

        (BundleService.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = BundleService;

        /**
         * Creates new BundleService service using the specified rpc implementation.
         * @function create
         * @memberof streaming.BundleService
         * @static
         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
         * @returns {BundleService} RPC service. Useful where requests and/or responses are streamed.
         */
        BundleService.create = function create(rpcImpl, requestDelimited, responseDelimited) {
            return new this(rpcImpl, requestDelimited, responseDelimited);
        };

        /**
         * Callback as used by {@link streaming.BundleService#simulateBundle}.
         * @memberof streaming.BundleService
         * @typedef SimulateBundleCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {streaming.BundleDelta} [response] BundleDelta
         */

        /**
         * Calls SimulateBundle.
         * @function simulateBundle
         * @memberof streaming.BundleService
         * @instance
         * @param {streaming.ISimulateBundleRequest} request SimulateBundleRequest message or plain object
         * @param {streaming.BundleService.SimulateBundleCallback} callback Node-style callback called with the error, if any, and BundleDelta
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(BundleService.prototype.simulateBundle = function simulateBundle(request, callback) {
            return this.rpcCall(simulateBundle, $root.streaming.SimulateBundleRequest, $root.streaming.BundleDelta, request, callback);
        }, "name", { value: "SimulateBundle" });

        /**
         * Calls SimulateBundle.
         * @function simulateBundle
         * @memberof streaming.BundleService
         * @instance
         * @param {streaming.ISimulateBundleRequest} request SimulateBundleRequest message or plain object
         * @returns {Promise<streaming.BundleDelta>} Promise
         * @variation 2
         */

        /**
         * Callback as used by {@link streaming.BundleService#createTransactions}.
         * @memberof streaming.BundleService
         * @typedef CreateTransactionsCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {streaming.TransactionsToSign} [response] TransactionsToSign
         */

        /**
         * Calls CreateTransactions.
         * @function createTransactions
         * @memberof streaming.BundleService
         * @instance
         * @param {streaming.ITransactionsBuld} request TransactionsBuld message or plain object
         * @param {streaming.BundleService.CreateTransactionsCallback} callback Node-style callback called with the error, if any, and TransactionsToSign
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(BundleService.prototype.createTransactions = function createTransactions(request, callback) {
            return this.rpcCall(createTransactions, $root.streaming.TransactionsBuld, $root.streaming.TransactionsToSign, request, callback);
        }, "name", { value: "CreateTransactions" });

        /**
         * Calls CreateTransactions.
         * @function createTransactions
         * @memberof streaming.BundleService
         * @instance
         * @param {streaming.ITransactionsBuld} request TransactionsBuld message or plain object
         * @returns {Promise<streaming.TransactionsToSign>} Promise
         * @variation 2
         */

        /**
         * Callback as used by {@link streaming.BundleService#sendTransactions}.
         * @memberof streaming.BundleService
         * @typedef SendTransactionsCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {streaming.UserBundleUpdate} [response] UserBundleUpdate
         */

        /**
         * Calls SendTransactions.
         * @function sendTransactions
         * @memberof streaming.BundleService
         * @instance
         * @param {streaming.ISignedTransactions} request SignedTransactions message or plain object
         * @param {streaming.BundleService.SendTransactionsCallback} callback Node-style callback called with the error, if any, and UserBundleUpdate
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(BundleService.prototype.sendTransactions = function sendTransactions(request, callback) {
            return this.rpcCall(sendTransactions, $root.streaming.SignedTransactions, $root.streaming.UserBundleUpdate, request, callback);
        }, "name", { value: "SendTransactions" });

        /**
         * Calls SendTransactions.
         * @function sendTransactions
         * @memberof streaming.BundleService
         * @instance
         * @param {streaming.ISignedTransactions} request SignedTransactions message or plain object
         * @returns {Promise<streaming.UserBundleUpdate>} Promise
         * @variation 2
         */

        /**
         * Callback as used by {@link streaming.BundleService#subscribeToBundles}.
         * @memberof streaming.BundleService
         * @typedef SubscribeToBundlesCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {streaming.UserBundleUpdate} [response] UserBundleUpdate
         */

        /**
         * Calls SubscribeToBundles.
         * @function subscribeToBundles
         * @memberof streaming.BundleService
         * @instance
         * @param {streaming.IUserBundleRequest} request UserBundleRequest message or plain object
         * @param {streaming.BundleService.SubscribeToBundlesCallback} callback Node-style callback called with the error, if any, and UserBundleUpdate
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(BundleService.prototype.subscribeToBundles = function subscribeToBundles(request, callback) {
            return this.rpcCall(subscribeToBundles, $root.streaming.UserBundleRequest, $root.streaming.UserBundleUpdate, request, callback);
        }, "name", { value: "SubscribeToBundles" });

        /**
         * Calls SubscribeToBundles.
         * @function subscribeToBundles
         * @memberof streaming.BundleService
         * @instance
         * @param {streaming.IUserBundleRequest} request UserBundleRequest message or plain object
         * @returns {Promise<streaming.UserBundleUpdate>} Promise
         * @variation 2
         */

        return BundleService;
    })();

    streaming.SimulateBundleRequest = (function() {

        /**
         * Properties of a SimulateBundleRequest.
         * @typedef {Object} streaming.SimulateBundleRequest.$Properties
         * @property {Array.<streaming.SwapSimulationRequest.$Properties>|null} [swaps] SimulateBundleRequest swaps
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a SimulateBundleRequest.
         * @memberof streaming
         * @interface ISimulateBundleRequest
         * @augments streaming.SimulateBundleRequest.$Properties
         * @deprecated Use streaming.SimulateBundleRequest.$Properties instead.
         */

        /**
         * Shape of a SimulateBundleRequest.
         * @typedef {streaming.SimulateBundleRequest.$Properties} streaming.SimulateBundleRequest.$Shape
         */

        /**
         * Constructs a new SimulateBundleRequest.
         * @memberof streaming
         * @classdesc Represents a SimulateBundleRequest.
         * @constructor
         * @param {streaming.SimulateBundleRequest.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        function SimulateBundleRequest(properties) {
            this.swaps = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SimulateBundleRequest swaps.
         * @member {Array.<streaming.SwapSimulationRequest.$Properties>} swaps
         * @memberof streaming.SimulateBundleRequest
         * @instance
         */
        SimulateBundleRequest.prototype.swaps = $util.emptyArray;

        /**
         * Creates a new SimulateBundleRequest instance using the specified properties.
         * @function create
         * @memberof streaming.SimulateBundleRequest
         * @static
         * @param {streaming.SimulateBundleRequest.$Properties=} [properties] Properties to set
         * @returns {streaming.SimulateBundleRequest} SimulateBundleRequest instance
         * @type {{
         *   (properties: streaming.SimulateBundleRequest.$Shape): streaming.SimulateBundleRequest & streaming.SimulateBundleRequest.$Shape;
         *   (properties?: streaming.SimulateBundleRequest.$Properties): streaming.SimulateBundleRequest;
         * }}
         */
        SimulateBundleRequest.create = function create(properties) {
            return new SimulateBundleRequest(properties);
        };

        /**
         * Encodes the specified SimulateBundleRequest message. Does not implicitly {@link streaming.SimulateBundleRequest.verify|verify} messages.
         * @function encode
         * @memberof streaming.SimulateBundleRequest
         * @static
         * @param {streaming.SimulateBundleRequest.$Properties} message SimulateBundleRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SimulateBundleRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.swaps != null && message.swaps.length)
                for (var i = 0; i < message.swaps.length; ++i)
                    $root.streaming.SwapSimulationRequest.encode(message.swaps[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (var i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified SimulateBundleRequest message, length delimited. Does not implicitly {@link streaming.SimulateBundleRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.SimulateBundleRequest
         * @static
         * @param {streaming.SimulateBundleRequest.$Properties} message SimulateBundleRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SimulateBundleRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a SimulateBundleRequest message from the specified reader or buffer.
         * @function decode
         * @memberof streaming.SimulateBundleRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {streaming.SimulateBundleRequest & streaming.SimulateBundleRequest.$Shape} SimulateBundleRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SimulateBundleRequest.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            var end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.streaming.SimulateBundleRequest();
            while (reader.pos < end) {
                var start = reader.pos;
                var tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                var wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if (!(message.swaps && message.swaps.length))
                            message.swaps = [];
                        message.swaps.push($root.streaming.SwapSimulationRequest.decode(reader, reader.uint32(), undefined, _depth + 1));
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            return message;
        };

        /**
         * Decodes a SimulateBundleRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.SimulateBundleRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.SimulateBundleRequest & streaming.SimulateBundleRequest.$Shape} SimulateBundleRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SimulateBundleRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a SimulateBundleRequest message.
         * @function verify
         * @memberof streaming.SimulateBundleRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        SimulateBundleRequest.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.swaps != null && message.hasOwnProperty("swaps")) {
                if (!Array.isArray(message.swaps))
                    return "swaps: array expected";
                for (var i = 0; i < message.swaps.length; ++i) {
                    var error = $root.streaming.SwapSimulationRequest.verify(message.swaps[i], _depth + 1);
                    if (error)
                        return "swaps." + error;
                }
            }
            return null;
        };

        /**
         * Creates a SimulateBundleRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof streaming.SimulateBundleRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {streaming.SimulateBundleRequest} SimulateBundleRequest
         */
        SimulateBundleRequest.fromObject = function fromObject(object, _depth) {
            if (object instanceof $root.streaming.SimulateBundleRequest)
                return object;
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            var message = new $root.streaming.SimulateBundleRequest();
            if (object.swaps) {
                if (!Array.isArray(object.swaps))
                    throw TypeError(".streaming.SimulateBundleRequest.swaps: array expected");
                message.swaps = Array(object.swaps.length);
                for (var i = 0; i < object.swaps.length; ++i) {
                    if (typeof object.swaps[i] !== "object")
                        throw TypeError(".streaming.SimulateBundleRequest.swaps: object expected");
                    message.swaps[i] = $root.streaming.SwapSimulationRequest.fromObject(object.swaps[i], _depth + 1);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a SimulateBundleRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof streaming.SimulateBundleRequest
         * @static
         * @param {streaming.SimulateBundleRequest} message SimulateBundleRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        SimulateBundleRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.swaps = [];
            if (message.swaps && message.swaps.length) {
                object.swaps = Array(message.swaps.length);
                for (var j = 0; j < message.swaps.length; ++j)
                    object.swaps[j] = $root.streaming.SwapSimulationRequest.toObject(message.swaps[j], options);
            }
            return object;
        };

        /**
         * Converts this SimulateBundleRequest to JSON.
         * @function toJSON
         * @memberof streaming.SimulateBundleRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        SimulateBundleRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for SimulateBundleRequest
         * @function getTypeUrl
         * @memberof streaming.SimulateBundleRequest
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        SimulateBundleRequest.getTypeUrl = function getTypeUrl(prefix) {
            if (prefix === undefined)
                prefix = "type.googleapis.com";
            return prefix + "/streaming.SimulateBundleRequest";
        };

        return SimulateBundleRequest;
    })();

    streaming.SwapSimulationRequest = (function() {

        /**
         * Properties of a SwapSimulationRequest.
         * @typedef {Object} streaming.SwapSimulationRequest.$Properties
         * @property {string|null} [id] SwapSimulationRequest id
         * @property {string|null} [inputMint] SwapSimulationRequest inputMint
         * @property {number|Long|null} [inputAmount] SwapSimulationRequest inputAmount
         * @property {string|null} [outputMint] SwapSimulationRequest outputMint
         * @property {number|Long|null} [expectedOutput] SwapSimulationRequest expectedOutput
         * @property {number|null} [slippageBps] SwapSimulationRequest slippageBps
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a SwapSimulationRequest.
         * @memberof streaming
         * @interface ISwapSimulationRequest
         * @augments streaming.SwapSimulationRequest.$Properties
         * @deprecated Use streaming.SwapSimulationRequest.$Properties instead.
         */

        /**
         * Shape of a SwapSimulationRequest.
         * @typedef {streaming.SwapSimulationRequest.$Properties} streaming.SwapSimulationRequest.$Shape
         */

        /**
         * Constructs a new SwapSimulationRequest.
         * @memberof streaming
         * @classdesc Represents a SwapSimulationRequest.
         * @constructor
         * @param {streaming.SwapSimulationRequest.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        function SwapSimulationRequest(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SwapSimulationRequest id.
         * @member {string} id
         * @memberof streaming.SwapSimulationRequest
         * @instance
         */
        SwapSimulationRequest.prototype.id = "";

        /**
         * SwapSimulationRequest inputMint.
         * @member {string} inputMint
         * @memberof streaming.SwapSimulationRequest
         * @instance
         */
        SwapSimulationRequest.prototype.inputMint = "";

        /**
         * SwapSimulationRequest inputAmount.
         * @member {number|Long} inputAmount
         * @memberof streaming.SwapSimulationRequest
         * @instance
         */
        SwapSimulationRequest.prototype.inputAmount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * SwapSimulationRequest outputMint.
         * @member {string} outputMint
         * @memberof streaming.SwapSimulationRequest
         * @instance
         */
        SwapSimulationRequest.prototype.outputMint = "";

        /**
         * SwapSimulationRequest expectedOutput.
         * @member {number|Long} expectedOutput
         * @memberof streaming.SwapSimulationRequest
         * @instance
         */
        SwapSimulationRequest.prototype.expectedOutput = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * SwapSimulationRequest slippageBps.
         * @member {number} slippageBps
         * @memberof streaming.SwapSimulationRequest
         * @instance
         */
        SwapSimulationRequest.prototype.slippageBps = 0;

        /**
         * Creates a new SwapSimulationRequest instance using the specified properties.
         * @function create
         * @memberof streaming.SwapSimulationRequest
         * @static
         * @param {streaming.SwapSimulationRequest.$Properties=} [properties] Properties to set
         * @returns {streaming.SwapSimulationRequest} SwapSimulationRequest instance
         * @type {{
         *   (properties: streaming.SwapSimulationRequest.$Shape): streaming.SwapSimulationRequest & streaming.SwapSimulationRequest.$Shape;
         *   (properties?: streaming.SwapSimulationRequest.$Properties): streaming.SwapSimulationRequest;
         * }}
         */
        SwapSimulationRequest.create = function create(properties) {
            return new SwapSimulationRequest(properties);
        };

        /**
         * Encodes the specified SwapSimulationRequest message. Does not implicitly {@link streaming.SwapSimulationRequest.verify|verify} messages.
         * @function encode
         * @memberof streaming.SwapSimulationRequest
         * @static
         * @param {streaming.SwapSimulationRequest.$Properties} message SwapSimulationRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SwapSimulationRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.inputMint != null && Object.hasOwnProperty.call(message, "inputMint"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.inputMint);
            if (message.inputAmount != null && Object.hasOwnProperty.call(message, "inputAmount"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.inputAmount);
            if (message.outputMint != null && Object.hasOwnProperty.call(message, "outputMint"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.outputMint);
            if (message.expectedOutput != null && Object.hasOwnProperty.call(message, "expectedOutput"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.expectedOutput);
            if (message.slippageBps != null && Object.hasOwnProperty.call(message, "slippageBps"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint32(message.slippageBps);
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (var i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified SwapSimulationRequest message, length delimited. Does not implicitly {@link streaming.SwapSimulationRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.SwapSimulationRequest
         * @static
         * @param {streaming.SwapSimulationRequest.$Properties} message SwapSimulationRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SwapSimulationRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a SwapSimulationRequest message from the specified reader or buffer.
         * @function decode
         * @memberof streaming.SwapSimulationRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {streaming.SwapSimulationRequest & streaming.SwapSimulationRequest.$Shape} SwapSimulationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SwapSimulationRequest.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            var end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.streaming.SwapSimulationRequest(), value;
            while (reader.pos < end) {
                var start = reader.pos;
                var tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                var wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.id = value;
                        else
                            delete message.id;
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.inputMint = value;
                        else
                            delete message.inputMint;
                        continue;
                    }
                case 3: {
                        if (wireType !== 0)
                            break;
                        if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                            message.inputAmount = value;
                        else
                            delete message.inputAmount;
                        continue;
                    }
                case 4: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.outputMint = value;
                        else
                            delete message.outputMint;
                        continue;
                    }
                case 5: {
                        if (wireType !== 0)
                            break;
                        if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                            message.expectedOutput = value;
                        else
                            delete message.expectedOutput;
                        continue;
                    }
                case 6: {
                        if (wireType !== 0)
                            break;
                        if (value = reader.uint32())
                            message.slippageBps = value;
                        else
                            delete message.slippageBps;
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            return message;
        };

        /**
         * Decodes a SwapSimulationRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.SwapSimulationRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.SwapSimulationRequest & streaming.SwapSimulationRequest.$Shape} SwapSimulationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SwapSimulationRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a SwapSimulationRequest message.
         * @function verify
         * @memberof streaming.SwapSimulationRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        SwapSimulationRequest.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.inputMint != null && message.hasOwnProperty("inputMint"))
                if (!$util.isString(message.inputMint))
                    return "inputMint: string expected";
            if (message.inputAmount != null && message.hasOwnProperty("inputAmount"))
                if (!$util.isInteger(message.inputAmount) && !(message.inputAmount && $util.isInteger(message.inputAmount.low) && $util.isInteger(message.inputAmount.high)))
                    return "inputAmount: integer|Long expected";
            if (message.outputMint != null && message.hasOwnProperty("outputMint"))
                if (!$util.isString(message.outputMint))
                    return "outputMint: string expected";
            if (message.expectedOutput != null && message.hasOwnProperty("expectedOutput"))
                if (!$util.isInteger(message.expectedOutput) && !(message.expectedOutput && $util.isInteger(message.expectedOutput.low) && $util.isInteger(message.expectedOutput.high)))
                    return "expectedOutput: integer|Long expected";
            if (message.slippageBps != null && message.hasOwnProperty("slippageBps"))
                if (!$util.isInteger(message.slippageBps))
                    return "slippageBps: integer expected";
            return null;
        };

        /**
         * Creates a SwapSimulationRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof streaming.SwapSimulationRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {streaming.SwapSimulationRequest} SwapSimulationRequest
         */
        SwapSimulationRequest.fromObject = function fromObject(object, _depth) {
            if (object instanceof $root.streaming.SwapSimulationRequest)
                return object;
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            var message = new $root.streaming.SwapSimulationRequest();
            if (object.id != null)
                if (typeof object.id !== "string" || object.id.length)
                    message.id = String(object.id);
            if (object.inputMint != null)
                if (typeof object.inputMint !== "string" || object.inputMint.length)
                    message.inputMint = String(object.inputMint);
            if (object.inputAmount != null)
                if (typeof object.inputAmount === "object" ? object.inputAmount.low || object.inputAmount.high : Number(object.inputAmount) !== 0)
                    if ($util.Long)
                        (message.inputAmount = $util.Long.fromValue(object.inputAmount)).unsigned = true;
                    else if (typeof object.inputAmount === "string")
                        message.inputAmount = parseInt(object.inputAmount, 10);
                    else if (typeof object.inputAmount === "number")
                        message.inputAmount = object.inputAmount;
                    else if (typeof object.inputAmount === "object")
                        message.inputAmount = new $util.LongBits(object.inputAmount.low >>> 0, object.inputAmount.high >>> 0).toNumber(true);
            if (object.outputMint != null)
                if (typeof object.outputMint !== "string" || object.outputMint.length)
                    message.outputMint = String(object.outputMint);
            if (object.expectedOutput != null)
                if (typeof object.expectedOutput === "object" ? object.expectedOutput.low || object.expectedOutput.high : Number(object.expectedOutput) !== 0)
                    if ($util.Long)
                        (message.expectedOutput = $util.Long.fromValue(object.expectedOutput)).unsigned = true;
                    else if (typeof object.expectedOutput === "string")
                        message.expectedOutput = parseInt(object.expectedOutput, 10);
                    else if (typeof object.expectedOutput === "number")
                        message.expectedOutput = object.expectedOutput;
                    else if (typeof object.expectedOutput === "object")
                        message.expectedOutput = new $util.LongBits(object.expectedOutput.low >>> 0, object.expectedOutput.high >>> 0).toNumber(true);
            if (object.slippageBps != null)
                if (Number(object.slippageBps) !== 0)
                    message.slippageBps = object.slippageBps >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a SwapSimulationRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof streaming.SwapSimulationRequest
         * @static
         * @param {streaming.SwapSimulationRequest} message SwapSimulationRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        SwapSimulationRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.id = "";
                object.inputMint = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.inputAmount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.inputAmount = options.longs === String ? "0" : 0;
                object.outputMint = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.expectedOutput = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.expectedOutput = options.longs === String ? "0" : 0;
                object.slippageBps = 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.inputMint != null && message.hasOwnProperty("inputMint"))
                object.inputMint = message.inputMint;
            if (message.inputAmount != null && message.hasOwnProperty("inputAmount"))
                if (typeof message.inputAmount === "number")
                    object.inputAmount = options.longs === String ? String(message.inputAmount) : message.inputAmount;
                else
                    object.inputAmount = options.longs === String ? $util.Long.prototype.toString.call(message.inputAmount) : options.longs === Number ? new $util.LongBits(message.inputAmount.low >>> 0, message.inputAmount.high >>> 0).toNumber(true) : message.inputAmount;
            if (message.outputMint != null && message.hasOwnProperty("outputMint"))
                object.outputMint = message.outputMint;
            if (message.expectedOutput != null && message.hasOwnProperty("expectedOutput"))
                if (typeof message.expectedOutput === "number")
                    object.expectedOutput = options.longs === String ? String(message.expectedOutput) : message.expectedOutput;
                else
                    object.expectedOutput = options.longs === String ? $util.Long.prototype.toString.call(message.expectedOutput) : options.longs === Number ? new $util.LongBits(message.expectedOutput.low >>> 0, message.expectedOutput.high >>> 0).toNumber(true) : message.expectedOutput;
            if (message.slippageBps != null && message.hasOwnProperty("slippageBps"))
                object.slippageBps = message.slippageBps;
            return object;
        };

        /**
         * Converts this SwapSimulationRequest to JSON.
         * @function toJSON
         * @memberof streaming.SwapSimulationRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        SwapSimulationRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for SwapSimulationRequest
         * @function getTypeUrl
         * @memberof streaming.SwapSimulationRequest
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        SwapSimulationRequest.getTypeUrl = function getTypeUrl(prefix) {
            if (prefix === undefined)
                prefix = "type.googleapis.com";
            return prefix + "/streaming.SwapSimulationRequest";
        };

        return SwapSimulationRequest;
    })();

    streaming.UserBundleRequest = (function() {

        /**
         * Properties of a UserBundleRequest.
         * @typedef {Object} streaming.UserBundleRequest.$Properties
         * @property {string|null} [userPk] UserBundleRequest userPk
         * @property {string|null} [bundleId] UserBundleRequest bundleId
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a UserBundleRequest.
         * @memberof streaming
         * @interface IUserBundleRequest
         * @augments streaming.UserBundleRequest.$Properties
         * @deprecated Use streaming.UserBundleRequest.$Properties instead.
         */

        /**
         * Shape of a UserBundleRequest.
         * @typedef {streaming.UserBundleRequest.$Properties} streaming.UserBundleRequest.$Shape
         */

        /**
         * Constructs a new UserBundleRequest.
         * @memberof streaming
         * @classdesc Represents a UserBundleRequest.
         * @constructor
         * @param {streaming.UserBundleRequest.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        function UserBundleRequest(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UserBundleRequest userPk.
         * @member {string} userPk
         * @memberof streaming.UserBundleRequest
         * @instance
         */
        UserBundleRequest.prototype.userPk = "";

        /**
         * UserBundleRequest bundleId.
         * @member {string|null|undefined} bundleId
         * @memberof streaming.UserBundleRequest
         * @instance
         */
        UserBundleRequest.prototype.bundleId = null;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(UserBundleRequest.prototype, "_bundleId", {
            get: $util.oneOfGetter($oneOfFields = ["bundleId"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new UserBundleRequest instance using the specified properties.
         * @function create
         * @memberof streaming.UserBundleRequest
         * @static
         * @param {streaming.UserBundleRequest.$Properties=} [properties] Properties to set
         * @returns {streaming.UserBundleRequest} UserBundleRequest instance
         * @type {{
         *   (properties: streaming.UserBundleRequest.$Shape): streaming.UserBundleRequest & streaming.UserBundleRequest.$Shape;
         *   (properties?: streaming.UserBundleRequest.$Properties): streaming.UserBundleRequest;
         * }}
         */
        UserBundleRequest.create = function create(properties) {
            return new UserBundleRequest(properties);
        };

        /**
         * Encodes the specified UserBundleRequest message. Does not implicitly {@link streaming.UserBundleRequest.verify|verify} messages.
         * @function encode
         * @memberof streaming.UserBundleRequest
         * @static
         * @param {streaming.UserBundleRequest.$Properties} message UserBundleRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UserBundleRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.userPk != null && Object.hasOwnProperty.call(message, "userPk"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.userPk);
            if (message.bundleId != null && Object.hasOwnProperty.call(message, "bundleId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.bundleId);
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (var i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified UserBundleRequest message, length delimited. Does not implicitly {@link streaming.UserBundleRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.UserBundleRequest
         * @static
         * @param {streaming.UserBundleRequest.$Properties} message UserBundleRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UserBundleRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a UserBundleRequest message from the specified reader or buffer.
         * @function decode
         * @memberof streaming.UserBundleRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {streaming.UserBundleRequest & streaming.UserBundleRequest.$Shape} UserBundleRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UserBundleRequest.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            var end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.streaming.UserBundleRequest(), value;
            while (reader.pos < end) {
                var start = reader.pos;
                var tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                var wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.userPk = value;
                        else
                            delete message.userPk;
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        message.bundleId = reader.string();
                        message._bundleId = "bundleId";
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            return message;
        };

        /**
         * Decodes a UserBundleRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.UserBundleRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.UserBundleRequest & streaming.UserBundleRequest.$Shape} UserBundleRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UserBundleRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a UserBundleRequest message.
         * @function verify
         * @memberof streaming.UserBundleRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UserBundleRequest.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            var properties = {};
            if (message.userPk != null && message.hasOwnProperty("userPk"))
                if (!$util.isString(message.userPk))
                    return "userPk: string expected";
            if (message.bundleId != null && message.hasOwnProperty("bundleId")) {
                properties._bundleId = 1;
                if (!$util.isString(message.bundleId))
                    return "bundleId: string expected";
            }
            return null;
        };

        /**
         * Creates a UserBundleRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof streaming.UserBundleRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {streaming.UserBundleRequest} UserBundleRequest
         */
        UserBundleRequest.fromObject = function fromObject(object, _depth) {
            if (object instanceof $root.streaming.UserBundleRequest)
                return object;
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            var message = new $root.streaming.UserBundleRequest();
            if (object.userPk != null)
                if (typeof object.userPk !== "string" || object.userPk.length)
                    message.userPk = String(object.userPk);
            if (object.bundleId != null)
                message.bundleId = String(object.bundleId);
            return message;
        };

        /**
         * Creates a plain object from a UserBundleRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof streaming.UserBundleRequest
         * @static
         * @param {streaming.UserBundleRequest} message UserBundleRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UserBundleRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.userPk = "";
            if (message.userPk != null && message.hasOwnProperty("userPk"))
                object.userPk = message.userPk;
            if (message.bundleId != null && message.hasOwnProperty("bundleId")) {
                object.bundleId = message.bundleId;
                if (options.oneofs)
                    object._bundleId = "bundleId";
            }
            return object;
        };

        /**
         * Converts this UserBundleRequest to JSON.
         * @function toJSON
         * @memberof streaming.UserBundleRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UserBundleRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for UserBundleRequest
         * @function getTypeUrl
         * @memberof streaming.UserBundleRequest
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        UserBundleRequest.getTypeUrl = function getTypeUrl(prefix) {
            if (prefix === undefined)
                prefix = "type.googleapis.com";
            return prefix + "/streaming.UserBundleRequest";
        };

        return UserBundleRequest;
    })();

    streaming.SignedTransactions = (function() {

        /**
         * Properties of a SignedTransactions.
         * @typedef {Object} streaming.SignedTransactions.$Properties
         * @property {Array.<string>|null} [transactions] SignedTransactions transactions
         * @property {string|null} [userPk] SignedTransactions userPk
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a SignedTransactions.
         * @memberof streaming
         * @interface ISignedTransactions
         * @augments streaming.SignedTransactions.$Properties
         * @deprecated Use streaming.SignedTransactions.$Properties instead.
         */

        /**
         * Shape of a SignedTransactions.
         * @typedef {streaming.SignedTransactions.$Properties} streaming.SignedTransactions.$Shape
         */

        /**
         * Constructs a new SignedTransactions.
         * @memberof streaming
         * @classdesc Represents a SignedTransactions.
         * @constructor
         * @param {streaming.SignedTransactions.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        function SignedTransactions(properties) {
            this.transactions = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SignedTransactions transactions.
         * @member {Array.<string>} transactions
         * @memberof streaming.SignedTransactions
         * @instance
         */
        SignedTransactions.prototype.transactions = $util.emptyArray;

        /**
         * SignedTransactions userPk.
         * @member {string} userPk
         * @memberof streaming.SignedTransactions
         * @instance
         */
        SignedTransactions.prototype.userPk = "";

        /**
         * Creates a new SignedTransactions instance using the specified properties.
         * @function create
         * @memberof streaming.SignedTransactions
         * @static
         * @param {streaming.SignedTransactions.$Properties=} [properties] Properties to set
         * @returns {streaming.SignedTransactions} SignedTransactions instance
         * @type {{
         *   (properties: streaming.SignedTransactions.$Shape): streaming.SignedTransactions & streaming.SignedTransactions.$Shape;
         *   (properties?: streaming.SignedTransactions.$Properties): streaming.SignedTransactions;
         * }}
         */
        SignedTransactions.create = function create(properties) {
            return new SignedTransactions(properties);
        };

        /**
         * Encodes the specified SignedTransactions message. Does not implicitly {@link streaming.SignedTransactions.verify|verify} messages.
         * @function encode
         * @memberof streaming.SignedTransactions
         * @static
         * @param {streaming.SignedTransactions.$Properties} message SignedTransactions message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SignedTransactions.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.transactions != null && message.transactions.length)
                for (var i = 0; i < message.transactions.length; ++i)
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.transactions[i]);
            if (message.userPk != null && Object.hasOwnProperty.call(message, "userPk"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.userPk);
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (var i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified SignedTransactions message, length delimited. Does not implicitly {@link streaming.SignedTransactions.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.SignedTransactions
         * @static
         * @param {streaming.SignedTransactions.$Properties} message SignedTransactions message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SignedTransactions.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a SignedTransactions message from the specified reader or buffer.
         * @function decode
         * @memberof streaming.SignedTransactions
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {streaming.SignedTransactions & streaming.SignedTransactions.$Shape} SignedTransactions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SignedTransactions.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            var end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.streaming.SignedTransactions(), value;
            while (reader.pos < end) {
                var start = reader.pos;
                var tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                var wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if (!(message.transactions && message.transactions.length))
                            message.transactions = [];
                        message.transactions.push(reader.string());
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.userPk = value;
                        else
                            delete message.userPk;
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            return message;
        };

        /**
         * Decodes a SignedTransactions message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.SignedTransactions
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.SignedTransactions & streaming.SignedTransactions.$Shape} SignedTransactions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SignedTransactions.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a SignedTransactions message.
         * @function verify
         * @memberof streaming.SignedTransactions
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        SignedTransactions.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.transactions != null && message.hasOwnProperty("transactions")) {
                if (!Array.isArray(message.transactions))
                    return "transactions: array expected";
                for (var i = 0; i < message.transactions.length; ++i)
                    if (!$util.isString(message.transactions[i]))
                        return "transactions: string[] expected";
            }
            if (message.userPk != null && message.hasOwnProperty("userPk"))
                if (!$util.isString(message.userPk))
                    return "userPk: string expected";
            return null;
        };

        /**
         * Creates a SignedTransactions message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof streaming.SignedTransactions
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {streaming.SignedTransactions} SignedTransactions
         */
        SignedTransactions.fromObject = function fromObject(object, _depth) {
            if (object instanceof $root.streaming.SignedTransactions)
                return object;
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            var message = new $root.streaming.SignedTransactions();
            if (object.transactions) {
                if (!Array.isArray(object.transactions))
                    throw TypeError(".streaming.SignedTransactions.transactions: array expected");
                message.transactions = Array(object.transactions.length);
                for (var i = 0; i < object.transactions.length; ++i)
                    message.transactions[i] = String(object.transactions[i]);
            }
            if (object.userPk != null)
                if (typeof object.userPk !== "string" || object.userPk.length)
                    message.userPk = String(object.userPk);
            return message;
        };

        /**
         * Creates a plain object from a SignedTransactions message. Also converts values to other types if specified.
         * @function toObject
         * @memberof streaming.SignedTransactions
         * @static
         * @param {streaming.SignedTransactions} message SignedTransactions
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        SignedTransactions.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.transactions = [];
            if (options.defaults)
                object.userPk = "";
            if (message.transactions && message.transactions.length) {
                object.transactions = Array(message.transactions.length);
                for (var j = 0; j < message.transactions.length; ++j)
                    object.transactions[j] = message.transactions[j];
            }
            if (message.userPk != null && message.hasOwnProperty("userPk"))
                object.userPk = message.userPk;
            return object;
        };

        /**
         * Converts this SignedTransactions to JSON.
         * @function toJSON
         * @memberof streaming.SignedTransactions
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        SignedTransactions.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for SignedTransactions
         * @function getTypeUrl
         * @memberof streaming.SignedTransactions
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        SignedTransactions.getTypeUrl = function getTypeUrl(prefix) {
            if (prefix === undefined)
                prefix = "type.googleapis.com";
            return prefix + "/streaming.SignedTransactions";
        };

        return SignedTransactions;
    })();

    streaming.BuiltTransaction = (function() {

        /**
         * Properties of a BuiltTransaction.
         * @typedef {Object} streaming.BuiltTransaction.$Properties
         * @property {string|null} [id] BuiltTransaction id
         * @property {string|null} [transactionBase58] BuiltTransaction transactionBase58
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a BuiltTransaction.
         * @memberof streaming
         * @interface IBuiltTransaction
         * @augments streaming.BuiltTransaction.$Properties
         * @deprecated Use streaming.BuiltTransaction.$Properties instead.
         */

        /**
         * Shape of a BuiltTransaction.
         * @typedef {streaming.BuiltTransaction.$Properties} streaming.BuiltTransaction.$Shape
         */

        /**
         * Constructs a new BuiltTransaction.
         * @memberof streaming
         * @classdesc Represents a BuiltTransaction.
         * @constructor
         * @param {streaming.BuiltTransaction.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        function BuiltTransaction(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * BuiltTransaction id.
         * @member {string} id
         * @memberof streaming.BuiltTransaction
         * @instance
         */
        BuiltTransaction.prototype.id = "";

        /**
         * BuiltTransaction transactionBase58.
         * @member {string} transactionBase58
         * @memberof streaming.BuiltTransaction
         * @instance
         */
        BuiltTransaction.prototype.transactionBase58 = "";

        /**
         * Creates a new BuiltTransaction instance using the specified properties.
         * @function create
         * @memberof streaming.BuiltTransaction
         * @static
         * @param {streaming.BuiltTransaction.$Properties=} [properties] Properties to set
         * @returns {streaming.BuiltTransaction} BuiltTransaction instance
         * @type {{
         *   (properties: streaming.BuiltTransaction.$Shape): streaming.BuiltTransaction & streaming.BuiltTransaction.$Shape;
         *   (properties?: streaming.BuiltTransaction.$Properties): streaming.BuiltTransaction;
         * }}
         */
        BuiltTransaction.create = function create(properties) {
            return new BuiltTransaction(properties);
        };

        /**
         * Encodes the specified BuiltTransaction message. Does not implicitly {@link streaming.BuiltTransaction.verify|verify} messages.
         * @function encode
         * @memberof streaming.BuiltTransaction
         * @static
         * @param {streaming.BuiltTransaction.$Properties} message BuiltTransaction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BuiltTransaction.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.transactionBase58 != null && Object.hasOwnProperty.call(message, "transactionBase58"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.transactionBase58);
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (var i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified BuiltTransaction message, length delimited. Does not implicitly {@link streaming.BuiltTransaction.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.BuiltTransaction
         * @static
         * @param {streaming.BuiltTransaction.$Properties} message BuiltTransaction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BuiltTransaction.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a BuiltTransaction message from the specified reader or buffer.
         * @function decode
         * @memberof streaming.BuiltTransaction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {streaming.BuiltTransaction & streaming.BuiltTransaction.$Shape} BuiltTransaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BuiltTransaction.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            var end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.streaming.BuiltTransaction(), value;
            while (reader.pos < end) {
                var start = reader.pos;
                var tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                var wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.id = value;
                        else
                            delete message.id;
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.transactionBase58 = value;
                        else
                            delete message.transactionBase58;
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            return message;
        };

        /**
         * Decodes a BuiltTransaction message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.BuiltTransaction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.BuiltTransaction & streaming.BuiltTransaction.$Shape} BuiltTransaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BuiltTransaction.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a BuiltTransaction message.
         * @function verify
         * @memberof streaming.BuiltTransaction
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        BuiltTransaction.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.transactionBase58 != null && message.hasOwnProperty("transactionBase58"))
                if (!$util.isString(message.transactionBase58))
                    return "transactionBase58: string expected";
            return null;
        };

        /**
         * Creates a BuiltTransaction message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof streaming.BuiltTransaction
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {streaming.BuiltTransaction} BuiltTransaction
         */
        BuiltTransaction.fromObject = function fromObject(object, _depth) {
            if (object instanceof $root.streaming.BuiltTransaction)
                return object;
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            var message = new $root.streaming.BuiltTransaction();
            if (object.id != null)
                if (typeof object.id !== "string" || object.id.length)
                    message.id = String(object.id);
            if (object.transactionBase58 != null)
                if (typeof object.transactionBase58 !== "string" || object.transactionBase58.length)
                    message.transactionBase58 = String(object.transactionBase58);
            return message;
        };

        /**
         * Creates a plain object from a BuiltTransaction message. Also converts values to other types if specified.
         * @function toObject
         * @memberof streaming.BuiltTransaction
         * @static
         * @param {streaming.BuiltTransaction} message BuiltTransaction
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        BuiltTransaction.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.id = "";
                object.transactionBase58 = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.transactionBase58 != null && message.hasOwnProperty("transactionBase58"))
                object.transactionBase58 = message.transactionBase58;
            return object;
        };

        /**
         * Converts this BuiltTransaction to JSON.
         * @function toJSON
         * @memberof streaming.BuiltTransaction
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        BuiltTransaction.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for BuiltTransaction
         * @function getTypeUrl
         * @memberof streaming.BuiltTransaction
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        BuiltTransaction.getTypeUrl = function getTypeUrl(prefix) {
            if (prefix === undefined)
                prefix = "type.googleapis.com";
            return prefix + "/streaming.BuiltTransaction";
        };

        return BuiltTransaction;
    })();

    streaming.TransactionsToSign = (function() {

        /**
         * Properties of a TransactionsToSign.
         * @typedef {Object} streaming.TransactionsToSign.$Properties
         * @property {Array.<streaming.BuiltTransaction.$Properties>|null} [transactions] TransactionsToSign transactions
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a TransactionsToSign.
         * @memberof streaming
         * @interface ITransactionsToSign
         * @augments streaming.TransactionsToSign.$Properties
         * @deprecated Use streaming.TransactionsToSign.$Properties instead.
         */

        /**
         * Shape of a TransactionsToSign.
         * @typedef {streaming.TransactionsToSign.$Properties} streaming.TransactionsToSign.$Shape
         */

        /**
         * Constructs a new TransactionsToSign.
         * @memberof streaming
         * @classdesc Represents a TransactionsToSign.
         * @constructor
         * @param {streaming.TransactionsToSign.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        function TransactionsToSign(properties) {
            this.transactions = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TransactionsToSign transactions.
         * @member {Array.<streaming.BuiltTransaction.$Properties>} transactions
         * @memberof streaming.TransactionsToSign
         * @instance
         */
        TransactionsToSign.prototype.transactions = $util.emptyArray;

        /**
         * Creates a new TransactionsToSign instance using the specified properties.
         * @function create
         * @memberof streaming.TransactionsToSign
         * @static
         * @param {streaming.TransactionsToSign.$Properties=} [properties] Properties to set
         * @returns {streaming.TransactionsToSign} TransactionsToSign instance
         * @type {{
         *   (properties: streaming.TransactionsToSign.$Shape): streaming.TransactionsToSign & streaming.TransactionsToSign.$Shape;
         *   (properties?: streaming.TransactionsToSign.$Properties): streaming.TransactionsToSign;
         * }}
         */
        TransactionsToSign.create = function create(properties) {
            return new TransactionsToSign(properties);
        };

        /**
         * Encodes the specified TransactionsToSign message. Does not implicitly {@link streaming.TransactionsToSign.verify|verify} messages.
         * @function encode
         * @memberof streaming.TransactionsToSign
         * @static
         * @param {streaming.TransactionsToSign.$Properties} message TransactionsToSign message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TransactionsToSign.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.transactions != null && message.transactions.length)
                for (var i = 0; i < message.transactions.length; ++i)
                    $root.streaming.BuiltTransaction.encode(message.transactions[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (var i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified TransactionsToSign message, length delimited. Does not implicitly {@link streaming.TransactionsToSign.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.TransactionsToSign
         * @static
         * @param {streaming.TransactionsToSign.$Properties} message TransactionsToSign message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TransactionsToSign.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TransactionsToSign message from the specified reader or buffer.
         * @function decode
         * @memberof streaming.TransactionsToSign
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {streaming.TransactionsToSign & streaming.TransactionsToSign.$Shape} TransactionsToSign
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TransactionsToSign.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            var end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.streaming.TransactionsToSign();
            while (reader.pos < end) {
                var start = reader.pos;
                var tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                var wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if (!(message.transactions && message.transactions.length))
                            message.transactions = [];
                        message.transactions.push($root.streaming.BuiltTransaction.decode(reader, reader.uint32(), undefined, _depth + 1));
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            return message;
        };

        /**
         * Decodes a TransactionsToSign message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.TransactionsToSign
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.TransactionsToSign & streaming.TransactionsToSign.$Shape} TransactionsToSign
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TransactionsToSign.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TransactionsToSign message.
         * @function verify
         * @memberof streaming.TransactionsToSign
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TransactionsToSign.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.transactions != null && message.hasOwnProperty("transactions")) {
                if (!Array.isArray(message.transactions))
                    return "transactions: array expected";
                for (var i = 0; i < message.transactions.length; ++i) {
                    var error = $root.streaming.BuiltTransaction.verify(message.transactions[i], _depth + 1);
                    if (error)
                        return "transactions." + error;
                }
            }
            return null;
        };

        /**
         * Creates a TransactionsToSign message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof streaming.TransactionsToSign
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {streaming.TransactionsToSign} TransactionsToSign
         */
        TransactionsToSign.fromObject = function fromObject(object, _depth) {
            if (object instanceof $root.streaming.TransactionsToSign)
                return object;
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            var message = new $root.streaming.TransactionsToSign();
            if (object.transactions) {
                if (!Array.isArray(object.transactions))
                    throw TypeError(".streaming.TransactionsToSign.transactions: array expected");
                message.transactions = Array(object.transactions.length);
                for (var i = 0; i < object.transactions.length; ++i) {
                    if (typeof object.transactions[i] !== "object")
                        throw TypeError(".streaming.TransactionsToSign.transactions: object expected");
                    message.transactions[i] = $root.streaming.BuiltTransaction.fromObject(object.transactions[i], _depth + 1);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a TransactionsToSign message. Also converts values to other types if specified.
         * @function toObject
         * @memberof streaming.TransactionsToSign
         * @static
         * @param {streaming.TransactionsToSign} message TransactionsToSign
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TransactionsToSign.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.transactions = [];
            if (message.transactions && message.transactions.length) {
                object.transactions = Array(message.transactions.length);
                for (var j = 0; j < message.transactions.length; ++j)
                    object.transactions[j] = $root.streaming.BuiltTransaction.toObject(message.transactions[j], options);
            }
            return object;
        };

        /**
         * Converts this TransactionsToSign to JSON.
         * @function toJSON
         * @memberof streaming.TransactionsToSign
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TransactionsToSign.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for TransactionsToSign
         * @function getTypeUrl
         * @memberof streaming.TransactionsToSign
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        TransactionsToSign.getTypeUrl = function getTypeUrl(prefix) {
            if (prefix === undefined)
                prefix = "type.googleapis.com";
            return prefix + "/streaming.TransactionsToSign";
        };

        return TransactionsToSign;
    })();

    streaming.BundleDelta = (function() {

        /**
         * Properties of a BundleDelta.
         * @typedef {Object} streaming.BundleDelta.$Properties
         * @property {Array.<streaming.TransactionDelta.$Properties>|null} [swaps] BundleDelta swaps
         * @property {number|Long|null} [jitoTipLamports] BundleDelta jitoTipLamports
         * @property {number|Long|null} [totalNetworkFeeLamports] BundleDelta totalNetworkFeeLamports
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a BundleDelta.
         * @memberof streaming
         * @interface IBundleDelta
         * @augments streaming.BundleDelta.$Properties
         * @deprecated Use streaming.BundleDelta.$Properties instead.
         */

        /**
         * Shape of a BundleDelta.
         * @typedef {streaming.BundleDelta.$Properties} streaming.BundleDelta.$Shape
         */

        /**
         * Constructs a new BundleDelta.
         * @memberof streaming
         * @classdesc Represents a BundleDelta.
         * @constructor
         * @param {streaming.BundleDelta.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        function BundleDelta(properties) {
            this.swaps = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * BundleDelta swaps.
         * @member {Array.<streaming.TransactionDelta.$Properties>} swaps
         * @memberof streaming.BundleDelta
         * @instance
         */
        BundleDelta.prototype.swaps = $util.emptyArray;

        /**
         * BundleDelta jitoTipLamports.
         * @member {number|Long} jitoTipLamports
         * @memberof streaming.BundleDelta
         * @instance
         */
        BundleDelta.prototype.jitoTipLamports = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * BundleDelta totalNetworkFeeLamports.
         * @member {number|Long} totalNetworkFeeLamports
         * @memberof streaming.BundleDelta
         * @instance
         */
        BundleDelta.prototype.totalNetworkFeeLamports = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new BundleDelta instance using the specified properties.
         * @function create
         * @memberof streaming.BundleDelta
         * @static
         * @param {streaming.BundleDelta.$Properties=} [properties] Properties to set
         * @returns {streaming.BundleDelta} BundleDelta instance
         * @type {{
         *   (properties: streaming.BundleDelta.$Shape): streaming.BundleDelta & streaming.BundleDelta.$Shape;
         *   (properties?: streaming.BundleDelta.$Properties): streaming.BundleDelta;
         * }}
         */
        BundleDelta.create = function create(properties) {
            return new BundleDelta(properties);
        };

        /**
         * Encodes the specified BundleDelta message. Does not implicitly {@link streaming.BundleDelta.verify|verify} messages.
         * @function encode
         * @memberof streaming.BundleDelta
         * @static
         * @param {streaming.BundleDelta.$Properties} message BundleDelta message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BundleDelta.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.swaps != null && message.swaps.length)
                for (var i = 0; i < message.swaps.length; ++i)
                    $root.streaming.TransactionDelta.encode(message.swaps[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.jitoTipLamports != null && Object.hasOwnProperty.call(message, "jitoTipLamports"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.jitoTipLamports);
            if (message.totalNetworkFeeLamports != null && Object.hasOwnProperty.call(message, "totalNetworkFeeLamports"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.totalNetworkFeeLamports);
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (var i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified BundleDelta message, length delimited. Does not implicitly {@link streaming.BundleDelta.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.BundleDelta
         * @static
         * @param {streaming.BundleDelta.$Properties} message BundleDelta message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BundleDelta.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a BundleDelta message from the specified reader or buffer.
         * @function decode
         * @memberof streaming.BundleDelta
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {streaming.BundleDelta & streaming.BundleDelta.$Shape} BundleDelta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BundleDelta.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            var end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.streaming.BundleDelta(), value;
            while (reader.pos < end) {
                var start = reader.pos;
                var tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                var wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if (!(message.swaps && message.swaps.length))
                            message.swaps = [];
                        message.swaps.push($root.streaming.TransactionDelta.decode(reader, reader.uint32(), undefined, _depth + 1));
                        continue;
                    }
                case 2: {
                        if (wireType !== 0)
                            break;
                        if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                            message.jitoTipLamports = value;
                        else
                            delete message.jitoTipLamports;
                        continue;
                    }
                case 3: {
                        if (wireType !== 0)
                            break;
                        if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                            message.totalNetworkFeeLamports = value;
                        else
                            delete message.totalNetworkFeeLamports;
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            return message;
        };

        /**
         * Decodes a BundleDelta message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.BundleDelta
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.BundleDelta & streaming.BundleDelta.$Shape} BundleDelta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BundleDelta.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a BundleDelta message.
         * @function verify
         * @memberof streaming.BundleDelta
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        BundleDelta.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.swaps != null && message.hasOwnProperty("swaps")) {
                if (!Array.isArray(message.swaps))
                    return "swaps: array expected";
                for (var i = 0; i < message.swaps.length; ++i) {
                    var error = $root.streaming.TransactionDelta.verify(message.swaps[i], _depth + 1);
                    if (error)
                        return "swaps." + error;
                }
            }
            if (message.jitoTipLamports != null && message.hasOwnProperty("jitoTipLamports"))
                if (!$util.isInteger(message.jitoTipLamports) && !(message.jitoTipLamports && $util.isInteger(message.jitoTipLamports.low) && $util.isInteger(message.jitoTipLamports.high)))
                    return "jitoTipLamports: integer|Long expected";
            if (message.totalNetworkFeeLamports != null && message.hasOwnProperty("totalNetworkFeeLamports"))
                if (!$util.isInteger(message.totalNetworkFeeLamports) && !(message.totalNetworkFeeLamports && $util.isInteger(message.totalNetworkFeeLamports.low) && $util.isInteger(message.totalNetworkFeeLamports.high)))
                    return "totalNetworkFeeLamports: integer|Long expected";
            return null;
        };

        /**
         * Creates a BundleDelta message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof streaming.BundleDelta
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {streaming.BundleDelta} BundleDelta
         */
        BundleDelta.fromObject = function fromObject(object, _depth) {
            if (object instanceof $root.streaming.BundleDelta)
                return object;
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            var message = new $root.streaming.BundleDelta();
            if (object.swaps) {
                if (!Array.isArray(object.swaps))
                    throw TypeError(".streaming.BundleDelta.swaps: array expected");
                message.swaps = Array(object.swaps.length);
                for (var i = 0; i < object.swaps.length; ++i) {
                    if (typeof object.swaps[i] !== "object")
                        throw TypeError(".streaming.BundleDelta.swaps: object expected");
                    message.swaps[i] = $root.streaming.TransactionDelta.fromObject(object.swaps[i], _depth + 1);
                }
            }
            if (object.jitoTipLamports != null)
                if (typeof object.jitoTipLamports === "object" ? object.jitoTipLamports.low || object.jitoTipLamports.high : Number(object.jitoTipLamports) !== 0)
                    if ($util.Long)
                        (message.jitoTipLamports = $util.Long.fromValue(object.jitoTipLamports)).unsigned = true;
                    else if (typeof object.jitoTipLamports === "string")
                        message.jitoTipLamports = parseInt(object.jitoTipLamports, 10);
                    else if (typeof object.jitoTipLamports === "number")
                        message.jitoTipLamports = object.jitoTipLamports;
                    else if (typeof object.jitoTipLamports === "object")
                        message.jitoTipLamports = new $util.LongBits(object.jitoTipLamports.low >>> 0, object.jitoTipLamports.high >>> 0).toNumber(true);
            if (object.totalNetworkFeeLamports != null)
                if (typeof object.totalNetworkFeeLamports === "object" ? object.totalNetworkFeeLamports.low || object.totalNetworkFeeLamports.high : Number(object.totalNetworkFeeLamports) !== 0)
                    if ($util.Long)
                        (message.totalNetworkFeeLamports = $util.Long.fromValue(object.totalNetworkFeeLamports)).unsigned = true;
                    else if (typeof object.totalNetworkFeeLamports === "string")
                        message.totalNetworkFeeLamports = parseInt(object.totalNetworkFeeLamports, 10);
                    else if (typeof object.totalNetworkFeeLamports === "number")
                        message.totalNetworkFeeLamports = object.totalNetworkFeeLamports;
                    else if (typeof object.totalNetworkFeeLamports === "object")
                        message.totalNetworkFeeLamports = new $util.LongBits(object.totalNetworkFeeLamports.low >>> 0, object.totalNetworkFeeLamports.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a BundleDelta message. Also converts values to other types if specified.
         * @function toObject
         * @memberof streaming.BundleDelta
         * @static
         * @param {streaming.BundleDelta} message BundleDelta
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        BundleDelta.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.swaps = [];
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.jitoTipLamports = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.jitoTipLamports = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.totalNetworkFeeLamports = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.totalNetworkFeeLamports = options.longs === String ? "0" : 0;
            }
            if (message.swaps && message.swaps.length) {
                object.swaps = Array(message.swaps.length);
                for (var j = 0; j < message.swaps.length; ++j)
                    object.swaps[j] = $root.streaming.TransactionDelta.toObject(message.swaps[j], options);
            }
            if (message.jitoTipLamports != null && message.hasOwnProperty("jitoTipLamports"))
                if (typeof message.jitoTipLamports === "number")
                    object.jitoTipLamports = options.longs === String ? String(message.jitoTipLamports) : message.jitoTipLamports;
                else
                    object.jitoTipLamports = options.longs === String ? $util.Long.prototype.toString.call(message.jitoTipLamports) : options.longs === Number ? new $util.LongBits(message.jitoTipLamports.low >>> 0, message.jitoTipLamports.high >>> 0).toNumber(true) : message.jitoTipLamports;
            if (message.totalNetworkFeeLamports != null && message.hasOwnProperty("totalNetworkFeeLamports"))
                if (typeof message.totalNetworkFeeLamports === "number")
                    object.totalNetworkFeeLamports = options.longs === String ? String(message.totalNetworkFeeLamports) : message.totalNetworkFeeLamports;
                else
                    object.totalNetworkFeeLamports = options.longs === String ? $util.Long.prototype.toString.call(message.totalNetworkFeeLamports) : options.longs === Number ? new $util.LongBits(message.totalNetworkFeeLamports.low >>> 0, message.totalNetworkFeeLamports.high >>> 0).toNumber(true) : message.totalNetworkFeeLamports;
            return object;
        };

        /**
         * Converts this BundleDelta to JSON.
         * @function toJSON
         * @memberof streaming.BundleDelta
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        BundleDelta.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for BundleDelta
         * @function getTypeUrl
         * @memberof streaming.BundleDelta
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        BundleDelta.getTypeUrl = function getTypeUrl(prefix) {
            if (prefix === undefined)
                prefix = "type.googleapis.com";
            return prefix + "/streaming.BundleDelta";
        };

        return BundleDelta;
    })();

    streaming.TransactionDelta = (function() {

        /**
         * Properties of a TransactionDelta.
         * @typedef {Object} streaming.TransactionDelta.$Properties
         * @property {string|null} [inputMint] TransactionDelta inputMint
         * @property {number|Long|null} [inputAmount] TransactionDelta inputAmount
         * @property {string|null} [outputMint] TransactionDelta outputMint
         * @property {number|Long|null} [expectedOutput] TransactionDelta expectedOutput
         * @property {number|Long|null} [minimumOutput] TransactionDelta minimumOutput
         * @property {number|Long|null} [jitoTipLamports] TransactionDelta jitoTipLamports
         * @property {number|Long|null} [networkFeeLamports] TransactionDelta networkFeeLamports
         * @property {number|null} [platformFeeBps] TransactionDelta platformFeeBps
         * @property {string|null} [id] TransactionDelta id
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a TransactionDelta.
         * @memberof streaming
         * @interface ITransactionDelta
         * @augments streaming.TransactionDelta.$Properties
         * @deprecated Use streaming.TransactionDelta.$Properties instead.
         */

        /**
         * Shape of a TransactionDelta.
         * @typedef {streaming.TransactionDelta.$Properties} streaming.TransactionDelta.$Shape
         */

        /**
         * Constructs a new TransactionDelta.
         * @memberof streaming
         * @classdesc Represents a TransactionDelta.
         * @constructor
         * @param {streaming.TransactionDelta.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        function TransactionDelta(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TransactionDelta inputMint.
         * @member {string} inputMint
         * @memberof streaming.TransactionDelta
         * @instance
         */
        TransactionDelta.prototype.inputMint = "";

        /**
         * TransactionDelta inputAmount.
         * @member {number|Long} inputAmount
         * @memberof streaming.TransactionDelta
         * @instance
         */
        TransactionDelta.prototype.inputAmount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * TransactionDelta outputMint.
         * @member {string} outputMint
         * @memberof streaming.TransactionDelta
         * @instance
         */
        TransactionDelta.prototype.outputMint = "";

        /**
         * TransactionDelta expectedOutput.
         * @member {number|Long} expectedOutput
         * @memberof streaming.TransactionDelta
         * @instance
         */
        TransactionDelta.prototype.expectedOutput = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * TransactionDelta minimumOutput.
         * @member {number|Long} minimumOutput
         * @memberof streaming.TransactionDelta
         * @instance
         */
        TransactionDelta.prototype.minimumOutput = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * TransactionDelta jitoTipLamports.
         * @member {number|Long} jitoTipLamports
         * @memberof streaming.TransactionDelta
         * @instance
         */
        TransactionDelta.prototype.jitoTipLamports = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * TransactionDelta networkFeeLamports.
         * @member {number|Long} networkFeeLamports
         * @memberof streaming.TransactionDelta
         * @instance
         */
        TransactionDelta.prototype.networkFeeLamports = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * TransactionDelta platformFeeBps.
         * @member {number} platformFeeBps
         * @memberof streaming.TransactionDelta
         * @instance
         */
        TransactionDelta.prototype.platformFeeBps = 0;

        /**
         * TransactionDelta id.
         * @member {string} id
         * @memberof streaming.TransactionDelta
         * @instance
         */
        TransactionDelta.prototype.id = "";

        /**
         * Creates a new TransactionDelta instance using the specified properties.
         * @function create
         * @memberof streaming.TransactionDelta
         * @static
         * @param {streaming.TransactionDelta.$Properties=} [properties] Properties to set
         * @returns {streaming.TransactionDelta} TransactionDelta instance
         * @type {{
         *   (properties: streaming.TransactionDelta.$Shape): streaming.TransactionDelta & streaming.TransactionDelta.$Shape;
         *   (properties?: streaming.TransactionDelta.$Properties): streaming.TransactionDelta;
         * }}
         */
        TransactionDelta.create = function create(properties) {
            return new TransactionDelta(properties);
        };

        /**
         * Encodes the specified TransactionDelta message. Does not implicitly {@link streaming.TransactionDelta.verify|verify} messages.
         * @function encode
         * @memberof streaming.TransactionDelta
         * @static
         * @param {streaming.TransactionDelta.$Properties} message TransactionDelta message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TransactionDelta.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.inputMint != null && Object.hasOwnProperty.call(message, "inputMint"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.inputMint);
            if (message.inputAmount != null && Object.hasOwnProperty.call(message, "inputAmount"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.inputAmount);
            if (message.outputMint != null && Object.hasOwnProperty.call(message, "outputMint"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.outputMint);
            if (message.expectedOutput != null && Object.hasOwnProperty.call(message, "expectedOutput"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.expectedOutput);
            if (message.minimumOutput != null && Object.hasOwnProperty.call(message, "minimumOutput"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.minimumOutput);
            if (message.jitoTipLamports != null && Object.hasOwnProperty.call(message, "jitoTipLamports"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint64(message.jitoTipLamports);
            if (message.networkFeeLamports != null && Object.hasOwnProperty.call(message, "networkFeeLamports"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint64(message.networkFeeLamports);
            if (message.platformFeeBps != null && Object.hasOwnProperty.call(message, "platformFeeBps"))
                writer.uint32(/* id 8, wireType 0 =*/64).uint32(message.platformFeeBps);
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.id);
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (var i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified TransactionDelta message, length delimited. Does not implicitly {@link streaming.TransactionDelta.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.TransactionDelta
         * @static
         * @param {streaming.TransactionDelta.$Properties} message TransactionDelta message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TransactionDelta.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TransactionDelta message from the specified reader or buffer.
         * @function decode
         * @memberof streaming.TransactionDelta
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {streaming.TransactionDelta & streaming.TransactionDelta.$Shape} TransactionDelta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TransactionDelta.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            var end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.streaming.TransactionDelta(), value;
            while (reader.pos < end) {
                var start = reader.pos;
                var tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                var wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.inputMint = value;
                        else
                            delete message.inputMint;
                        continue;
                    }
                case 2: {
                        if (wireType !== 0)
                            break;
                        if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                            message.inputAmount = value;
                        else
                            delete message.inputAmount;
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.outputMint = value;
                        else
                            delete message.outputMint;
                        continue;
                    }
                case 4: {
                        if (wireType !== 0)
                            break;
                        if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                            message.expectedOutput = value;
                        else
                            delete message.expectedOutput;
                        continue;
                    }
                case 5: {
                        if (wireType !== 0)
                            break;
                        if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                            message.minimumOutput = value;
                        else
                            delete message.minimumOutput;
                        continue;
                    }
                case 6: {
                        if (wireType !== 0)
                            break;
                        if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                            message.jitoTipLamports = value;
                        else
                            delete message.jitoTipLamports;
                        continue;
                    }
                case 7: {
                        if (wireType !== 0)
                            break;
                        if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                            message.networkFeeLamports = value;
                        else
                            delete message.networkFeeLamports;
                        continue;
                    }
                case 8: {
                        if (wireType !== 0)
                            break;
                        if (value = reader.uint32())
                            message.platformFeeBps = value;
                        else
                            delete message.platformFeeBps;
                        continue;
                    }
                case 9: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.id = value;
                        else
                            delete message.id;
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            return message;
        };

        /**
         * Decodes a TransactionDelta message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.TransactionDelta
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.TransactionDelta & streaming.TransactionDelta.$Shape} TransactionDelta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TransactionDelta.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TransactionDelta message.
         * @function verify
         * @memberof streaming.TransactionDelta
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TransactionDelta.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.inputMint != null && message.hasOwnProperty("inputMint"))
                if (!$util.isString(message.inputMint))
                    return "inputMint: string expected";
            if (message.inputAmount != null && message.hasOwnProperty("inputAmount"))
                if (!$util.isInteger(message.inputAmount) && !(message.inputAmount && $util.isInteger(message.inputAmount.low) && $util.isInteger(message.inputAmount.high)))
                    return "inputAmount: integer|Long expected";
            if (message.outputMint != null && message.hasOwnProperty("outputMint"))
                if (!$util.isString(message.outputMint))
                    return "outputMint: string expected";
            if (message.expectedOutput != null && message.hasOwnProperty("expectedOutput"))
                if (!$util.isInteger(message.expectedOutput) && !(message.expectedOutput && $util.isInteger(message.expectedOutput.low) && $util.isInteger(message.expectedOutput.high)))
                    return "expectedOutput: integer|Long expected";
            if (message.minimumOutput != null && message.hasOwnProperty("minimumOutput"))
                if (!$util.isInteger(message.minimumOutput) && !(message.minimumOutput && $util.isInteger(message.minimumOutput.low) && $util.isInteger(message.minimumOutput.high)))
                    return "minimumOutput: integer|Long expected";
            if (message.jitoTipLamports != null && message.hasOwnProperty("jitoTipLamports"))
                if (!$util.isInteger(message.jitoTipLamports) && !(message.jitoTipLamports && $util.isInteger(message.jitoTipLamports.low) && $util.isInteger(message.jitoTipLamports.high)))
                    return "jitoTipLamports: integer|Long expected";
            if (message.networkFeeLamports != null && message.hasOwnProperty("networkFeeLamports"))
                if (!$util.isInteger(message.networkFeeLamports) && !(message.networkFeeLamports && $util.isInteger(message.networkFeeLamports.low) && $util.isInteger(message.networkFeeLamports.high)))
                    return "networkFeeLamports: integer|Long expected";
            if (message.platformFeeBps != null && message.hasOwnProperty("platformFeeBps"))
                if (!$util.isInteger(message.platformFeeBps))
                    return "platformFeeBps: integer expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            return null;
        };

        /**
         * Creates a TransactionDelta message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof streaming.TransactionDelta
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {streaming.TransactionDelta} TransactionDelta
         */
        TransactionDelta.fromObject = function fromObject(object, _depth) {
            if (object instanceof $root.streaming.TransactionDelta)
                return object;
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            var message = new $root.streaming.TransactionDelta();
            if (object.inputMint != null)
                if (typeof object.inputMint !== "string" || object.inputMint.length)
                    message.inputMint = String(object.inputMint);
            if (object.inputAmount != null)
                if (typeof object.inputAmount === "object" ? object.inputAmount.low || object.inputAmount.high : Number(object.inputAmount) !== 0)
                    if ($util.Long)
                        (message.inputAmount = $util.Long.fromValue(object.inputAmount)).unsigned = true;
                    else if (typeof object.inputAmount === "string")
                        message.inputAmount = parseInt(object.inputAmount, 10);
                    else if (typeof object.inputAmount === "number")
                        message.inputAmount = object.inputAmount;
                    else if (typeof object.inputAmount === "object")
                        message.inputAmount = new $util.LongBits(object.inputAmount.low >>> 0, object.inputAmount.high >>> 0).toNumber(true);
            if (object.outputMint != null)
                if (typeof object.outputMint !== "string" || object.outputMint.length)
                    message.outputMint = String(object.outputMint);
            if (object.expectedOutput != null)
                if (typeof object.expectedOutput === "object" ? object.expectedOutput.low || object.expectedOutput.high : Number(object.expectedOutput) !== 0)
                    if ($util.Long)
                        (message.expectedOutput = $util.Long.fromValue(object.expectedOutput)).unsigned = true;
                    else if (typeof object.expectedOutput === "string")
                        message.expectedOutput = parseInt(object.expectedOutput, 10);
                    else if (typeof object.expectedOutput === "number")
                        message.expectedOutput = object.expectedOutput;
                    else if (typeof object.expectedOutput === "object")
                        message.expectedOutput = new $util.LongBits(object.expectedOutput.low >>> 0, object.expectedOutput.high >>> 0).toNumber(true);
            if (object.minimumOutput != null)
                if (typeof object.minimumOutput === "object" ? object.minimumOutput.low || object.minimumOutput.high : Number(object.minimumOutput) !== 0)
                    if ($util.Long)
                        (message.minimumOutput = $util.Long.fromValue(object.minimumOutput)).unsigned = true;
                    else if (typeof object.minimumOutput === "string")
                        message.minimumOutput = parseInt(object.minimumOutput, 10);
                    else if (typeof object.minimumOutput === "number")
                        message.minimumOutput = object.minimumOutput;
                    else if (typeof object.minimumOutput === "object")
                        message.minimumOutput = new $util.LongBits(object.minimumOutput.low >>> 0, object.minimumOutput.high >>> 0).toNumber(true);
            if (object.jitoTipLamports != null)
                if (typeof object.jitoTipLamports === "object" ? object.jitoTipLamports.low || object.jitoTipLamports.high : Number(object.jitoTipLamports) !== 0)
                    if ($util.Long)
                        (message.jitoTipLamports = $util.Long.fromValue(object.jitoTipLamports)).unsigned = true;
                    else if (typeof object.jitoTipLamports === "string")
                        message.jitoTipLamports = parseInt(object.jitoTipLamports, 10);
                    else if (typeof object.jitoTipLamports === "number")
                        message.jitoTipLamports = object.jitoTipLamports;
                    else if (typeof object.jitoTipLamports === "object")
                        message.jitoTipLamports = new $util.LongBits(object.jitoTipLamports.low >>> 0, object.jitoTipLamports.high >>> 0).toNumber(true);
            if (object.networkFeeLamports != null)
                if (typeof object.networkFeeLamports === "object" ? object.networkFeeLamports.low || object.networkFeeLamports.high : Number(object.networkFeeLamports) !== 0)
                    if ($util.Long)
                        (message.networkFeeLamports = $util.Long.fromValue(object.networkFeeLamports)).unsigned = true;
                    else if (typeof object.networkFeeLamports === "string")
                        message.networkFeeLamports = parseInt(object.networkFeeLamports, 10);
                    else if (typeof object.networkFeeLamports === "number")
                        message.networkFeeLamports = object.networkFeeLamports;
                    else if (typeof object.networkFeeLamports === "object")
                        message.networkFeeLamports = new $util.LongBits(object.networkFeeLamports.low >>> 0, object.networkFeeLamports.high >>> 0).toNumber(true);
            if (object.platformFeeBps != null)
                if (Number(object.platformFeeBps) !== 0)
                    message.platformFeeBps = object.platformFeeBps >>> 0;
            if (object.id != null)
                if (typeof object.id !== "string" || object.id.length)
                    message.id = String(object.id);
            return message;
        };

        /**
         * Creates a plain object from a TransactionDelta message. Also converts values to other types if specified.
         * @function toObject
         * @memberof streaming.TransactionDelta
         * @static
         * @param {streaming.TransactionDelta} message TransactionDelta
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TransactionDelta.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.inputMint = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.inputAmount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.inputAmount = options.longs === String ? "0" : 0;
                object.outputMint = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.expectedOutput = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.expectedOutput = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.minimumOutput = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.minimumOutput = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.jitoTipLamports = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.jitoTipLamports = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.networkFeeLamports = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.networkFeeLamports = options.longs === String ? "0" : 0;
                object.platformFeeBps = 0;
                object.id = "";
            }
            if (message.inputMint != null && message.hasOwnProperty("inputMint"))
                object.inputMint = message.inputMint;
            if (message.inputAmount != null && message.hasOwnProperty("inputAmount"))
                if (typeof message.inputAmount === "number")
                    object.inputAmount = options.longs === String ? String(message.inputAmount) : message.inputAmount;
                else
                    object.inputAmount = options.longs === String ? $util.Long.prototype.toString.call(message.inputAmount) : options.longs === Number ? new $util.LongBits(message.inputAmount.low >>> 0, message.inputAmount.high >>> 0).toNumber(true) : message.inputAmount;
            if (message.outputMint != null && message.hasOwnProperty("outputMint"))
                object.outputMint = message.outputMint;
            if (message.expectedOutput != null && message.hasOwnProperty("expectedOutput"))
                if (typeof message.expectedOutput === "number")
                    object.expectedOutput = options.longs === String ? String(message.expectedOutput) : message.expectedOutput;
                else
                    object.expectedOutput = options.longs === String ? $util.Long.prototype.toString.call(message.expectedOutput) : options.longs === Number ? new $util.LongBits(message.expectedOutput.low >>> 0, message.expectedOutput.high >>> 0).toNumber(true) : message.expectedOutput;
            if (message.minimumOutput != null && message.hasOwnProperty("minimumOutput"))
                if (typeof message.minimumOutput === "number")
                    object.minimumOutput = options.longs === String ? String(message.minimumOutput) : message.minimumOutput;
                else
                    object.minimumOutput = options.longs === String ? $util.Long.prototype.toString.call(message.minimumOutput) : options.longs === Number ? new $util.LongBits(message.minimumOutput.low >>> 0, message.minimumOutput.high >>> 0).toNumber(true) : message.minimumOutput;
            if (message.jitoTipLamports != null && message.hasOwnProperty("jitoTipLamports"))
                if (typeof message.jitoTipLamports === "number")
                    object.jitoTipLamports = options.longs === String ? String(message.jitoTipLamports) : message.jitoTipLamports;
                else
                    object.jitoTipLamports = options.longs === String ? $util.Long.prototype.toString.call(message.jitoTipLamports) : options.longs === Number ? new $util.LongBits(message.jitoTipLamports.low >>> 0, message.jitoTipLamports.high >>> 0).toNumber(true) : message.jitoTipLamports;
            if (message.networkFeeLamports != null && message.hasOwnProperty("networkFeeLamports"))
                if (typeof message.networkFeeLamports === "number")
                    object.networkFeeLamports = options.longs === String ? String(message.networkFeeLamports) : message.networkFeeLamports;
                else
                    object.networkFeeLamports = options.longs === String ? $util.Long.prototype.toString.call(message.networkFeeLamports) : options.longs === Number ? new $util.LongBits(message.networkFeeLamports.low >>> 0, message.networkFeeLamports.high >>> 0).toNumber(true) : message.networkFeeLamports;
            if (message.platformFeeBps != null && message.hasOwnProperty("platformFeeBps"))
                object.platformFeeBps = message.platformFeeBps;
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            return object;
        };

        /**
         * Converts this TransactionDelta to JSON.
         * @function toJSON
         * @memberof streaming.TransactionDelta
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TransactionDelta.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for TransactionDelta
         * @function getTypeUrl
         * @memberof streaming.TransactionDelta
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        TransactionDelta.getTypeUrl = function getTypeUrl(prefix) {
            if (prefix === undefined)
                prefix = "type.googleapis.com";
            return prefix + "/streaming.TransactionDelta";
        };

        return TransactionDelta;
    })();

    streaming.TransactionsBuld = (function() {

        /**
         * Properties of a TransactionsBuld.
         * @typedef {Object} streaming.TransactionsBuld.$Properties
         * @property {Array.<streaming.TrasnactionInstruction.$Properties>|null} [transactions] TransactionsBuld transactions
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a TransactionsBuld.
         * @memberof streaming
         * @interface ITransactionsBuld
         * @augments streaming.TransactionsBuld.$Properties
         * @deprecated Use streaming.TransactionsBuld.$Properties instead.
         */

        /**
         * Shape of a TransactionsBuld.
         * @typedef {streaming.TransactionsBuld.$Properties} streaming.TransactionsBuld.$Shape
         */

        /**
         * Constructs a new TransactionsBuld.
         * @memberof streaming
         * @classdesc Represents a TransactionsBuld.
         * @constructor
         * @param {streaming.TransactionsBuld.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        function TransactionsBuld(properties) {
            this.transactions = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TransactionsBuld transactions.
         * @member {Array.<streaming.TrasnactionInstruction.$Properties>} transactions
         * @memberof streaming.TransactionsBuld
         * @instance
         */
        TransactionsBuld.prototype.transactions = $util.emptyArray;

        /**
         * Creates a new TransactionsBuld instance using the specified properties.
         * @function create
         * @memberof streaming.TransactionsBuld
         * @static
         * @param {streaming.TransactionsBuld.$Properties=} [properties] Properties to set
         * @returns {streaming.TransactionsBuld} TransactionsBuld instance
         * @type {{
         *   (properties: streaming.TransactionsBuld.$Shape): streaming.TransactionsBuld & streaming.TransactionsBuld.$Shape;
         *   (properties?: streaming.TransactionsBuld.$Properties): streaming.TransactionsBuld;
         * }}
         */
        TransactionsBuld.create = function create(properties) {
            return new TransactionsBuld(properties);
        };

        /**
         * Encodes the specified TransactionsBuld message. Does not implicitly {@link streaming.TransactionsBuld.verify|verify} messages.
         * @function encode
         * @memberof streaming.TransactionsBuld
         * @static
         * @param {streaming.TransactionsBuld.$Properties} message TransactionsBuld message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TransactionsBuld.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.transactions != null && message.transactions.length)
                for (var i = 0; i < message.transactions.length; ++i)
                    $root.streaming.TrasnactionInstruction.encode(message.transactions[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (var i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified TransactionsBuld message, length delimited. Does not implicitly {@link streaming.TransactionsBuld.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.TransactionsBuld
         * @static
         * @param {streaming.TransactionsBuld.$Properties} message TransactionsBuld message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TransactionsBuld.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TransactionsBuld message from the specified reader or buffer.
         * @function decode
         * @memberof streaming.TransactionsBuld
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {streaming.TransactionsBuld & streaming.TransactionsBuld.$Shape} TransactionsBuld
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TransactionsBuld.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            var end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.streaming.TransactionsBuld();
            while (reader.pos < end) {
                var start = reader.pos;
                var tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                var wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if (!(message.transactions && message.transactions.length))
                            message.transactions = [];
                        message.transactions.push($root.streaming.TrasnactionInstruction.decode(reader, reader.uint32(), undefined, _depth + 1));
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            return message;
        };

        /**
         * Decodes a TransactionsBuld message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.TransactionsBuld
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.TransactionsBuld & streaming.TransactionsBuld.$Shape} TransactionsBuld
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TransactionsBuld.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TransactionsBuld message.
         * @function verify
         * @memberof streaming.TransactionsBuld
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TransactionsBuld.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.transactions != null && message.hasOwnProperty("transactions")) {
                if (!Array.isArray(message.transactions))
                    return "transactions: array expected";
                for (var i = 0; i < message.transactions.length; ++i) {
                    var error = $root.streaming.TrasnactionInstruction.verify(message.transactions[i], _depth + 1);
                    if (error)
                        return "transactions." + error;
                }
            }
            return null;
        };

        /**
         * Creates a TransactionsBuld message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof streaming.TransactionsBuld
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {streaming.TransactionsBuld} TransactionsBuld
         */
        TransactionsBuld.fromObject = function fromObject(object, _depth) {
            if (object instanceof $root.streaming.TransactionsBuld)
                return object;
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            var message = new $root.streaming.TransactionsBuld();
            if (object.transactions) {
                if (!Array.isArray(object.transactions))
                    throw TypeError(".streaming.TransactionsBuld.transactions: array expected");
                message.transactions = Array(object.transactions.length);
                for (var i = 0; i < object.transactions.length; ++i) {
                    if (typeof object.transactions[i] !== "object")
                        throw TypeError(".streaming.TransactionsBuld.transactions: object expected");
                    message.transactions[i] = $root.streaming.TrasnactionInstruction.fromObject(object.transactions[i], _depth + 1);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a TransactionsBuld message. Also converts values to other types if specified.
         * @function toObject
         * @memberof streaming.TransactionsBuld
         * @static
         * @param {streaming.TransactionsBuld} message TransactionsBuld
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TransactionsBuld.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.transactions = [];
            if (message.transactions && message.transactions.length) {
                object.transactions = Array(message.transactions.length);
                for (var j = 0; j < message.transactions.length; ++j)
                    object.transactions[j] = $root.streaming.TrasnactionInstruction.toObject(message.transactions[j], options);
            }
            return object;
        };

        /**
         * Converts this TransactionsBuld to JSON.
         * @function toJSON
         * @memberof streaming.TransactionsBuld
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TransactionsBuld.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for TransactionsBuld
         * @function getTypeUrl
         * @memberof streaming.TransactionsBuld
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        TransactionsBuld.getTypeUrl = function getTypeUrl(prefix) {
            if (prefix === undefined)
                prefix = "type.googleapis.com";
            return prefix + "/streaming.TransactionsBuld";
        };

        return TransactionsBuld;
    })();

    streaming.TrasnactionInstruction = (function() {

        /**
         * Properties of a TrasnactionInstruction.
         * @typedef {Object} streaming.TrasnactionInstruction.$Properties
         * @property {string|null} [inputMint] TrasnactionInstruction inputMint
         * @property {string|null} [outputMint] TrasnactionInstruction outputMint
         * @property {number|Long|null} [amount] TrasnactionInstruction amount
         * @property {number|null} [slippageBps] TrasnactionInstruction slippageBps
         * @property {streaming.QuoteOptions.$Properties|null} [options] TrasnactionInstruction options
         * @property {string|null} [userPk] TrasnactionInstruction userPk
         * @property {string|null} [optionalDestination] TrasnactionInstruction optionalDestination
         * @property {string|null} [id] TrasnactionInstruction id
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a TrasnactionInstruction.
         * @memberof streaming
         * @interface ITrasnactionInstruction
         * @augments streaming.TrasnactionInstruction.$Properties
         * @deprecated Use streaming.TrasnactionInstruction.$Properties instead.
         */

        /**
         * Shape of a TrasnactionInstruction.
         * @typedef {streaming.TrasnactionInstruction.$Properties} streaming.TrasnactionInstruction.$Shape
         */

        /**
         * Constructs a new TrasnactionInstruction.
         * @memberof streaming
         * @classdesc Represents a TrasnactionInstruction.
         * @constructor
         * @param {streaming.TrasnactionInstruction.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        function TrasnactionInstruction(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TrasnactionInstruction inputMint.
         * @member {string} inputMint
         * @memberof streaming.TrasnactionInstruction
         * @instance
         */
        TrasnactionInstruction.prototype.inputMint = "";

        /**
         * TrasnactionInstruction outputMint.
         * @member {string} outputMint
         * @memberof streaming.TrasnactionInstruction
         * @instance
         */
        TrasnactionInstruction.prototype.outputMint = "";

        /**
         * TrasnactionInstruction amount.
         * @member {number|Long} amount
         * @memberof streaming.TrasnactionInstruction
         * @instance
         */
        TrasnactionInstruction.prototype.amount = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * TrasnactionInstruction slippageBps.
         * @member {number} slippageBps
         * @memberof streaming.TrasnactionInstruction
         * @instance
         */
        TrasnactionInstruction.prototype.slippageBps = 0;

        /**
         * TrasnactionInstruction options.
         * @member {streaming.QuoteOptions.$Properties|null|undefined} options
         * @memberof streaming.TrasnactionInstruction
         * @instance
         */
        TrasnactionInstruction.prototype.options = null;

        /**
         * TrasnactionInstruction userPk.
         * @member {string} userPk
         * @memberof streaming.TrasnactionInstruction
         * @instance
         */
        TrasnactionInstruction.prototype.userPk = "";

        /**
         * TrasnactionInstruction optionalDestination.
         * @member {string|null|undefined} optionalDestination
         * @memberof streaming.TrasnactionInstruction
         * @instance
         */
        TrasnactionInstruction.prototype.optionalDestination = null;

        /**
         * TrasnactionInstruction id.
         * @member {string} id
         * @memberof streaming.TrasnactionInstruction
         * @instance
         */
        TrasnactionInstruction.prototype.id = "";

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(TrasnactionInstruction.prototype, "_optionalDestination", {
            get: $util.oneOfGetter($oneOfFields = ["optionalDestination"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new TrasnactionInstruction instance using the specified properties.
         * @function create
         * @memberof streaming.TrasnactionInstruction
         * @static
         * @param {streaming.TrasnactionInstruction.$Properties=} [properties] Properties to set
         * @returns {streaming.TrasnactionInstruction} TrasnactionInstruction instance
         * @type {{
         *   (properties: streaming.TrasnactionInstruction.$Shape): streaming.TrasnactionInstruction & streaming.TrasnactionInstruction.$Shape;
         *   (properties?: streaming.TrasnactionInstruction.$Properties): streaming.TrasnactionInstruction;
         * }}
         */
        TrasnactionInstruction.create = function create(properties) {
            return new TrasnactionInstruction(properties);
        };

        /**
         * Encodes the specified TrasnactionInstruction message. Does not implicitly {@link streaming.TrasnactionInstruction.verify|verify} messages.
         * @function encode
         * @memberof streaming.TrasnactionInstruction
         * @static
         * @param {streaming.TrasnactionInstruction.$Properties} message TrasnactionInstruction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TrasnactionInstruction.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.inputMint != null && Object.hasOwnProperty.call(message, "inputMint"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.inputMint);
            if (message.outputMint != null && Object.hasOwnProperty.call(message, "outputMint"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.outputMint);
            if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.amount);
            if (message.slippageBps != null && Object.hasOwnProperty.call(message, "slippageBps"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.slippageBps);
            if (message.options != null && Object.hasOwnProperty.call(message, "options"))
                $root.streaming.QuoteOptions.encode(message.options, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.userPk != null && Object.hasOwnProperty.call(message, "userPk"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.userPk);
            if (message.optionalDestination != null && Object.hasOwnProperty.call(message, "optionalDestination"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.optionalDestination);
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.id);
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (var i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified TrasnactionInstruction message, length delimited. Does not implicitly {@link streaming.TrasnactionInstruction.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.TrasnactionInstruction
         * @static
         * @param {streaming.TrasnactionInstruction.$Properties} message TrasnactionInstruction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TrasnactionInstruction.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TrasnactionInstruction message from the specified reader or buffer.
         * @function decode
         * @memberof streaming.TrasnactionInstruction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {streaming.TrasnactionInstruction & streaming.TrasnactionInstruction.$Shape} TrasnactionInstruction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TrasnactionInstruction.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            var end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.streaming.TrasnactionInstruction(), value;
            while (reader.pos < end) {
                var start = reader.pos;
                var tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                var wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.inputMint = value;
                        else
                            delete message.inputMint;
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.outputMint = value;
                        else
                            delete message.outputMint;
                        continue;
                    }
                case 3: {
                        if (wireType !== 0)
                            break;
                        if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                            message.amount = value;
                        else
                            delete message.amount;
                        continue;
                    }
                case 4: {
                        if (wireType !== 0)
                            break;
                        if (value = reader.uint32())
                            message.slippageBps = value;
                        else
                            delete message.slippageBps;
                        continue;
                    }
                case 5: {
                        if (wireType !== 2)
                            break;
                        message.options = $root.streaming.QuoteOptions.decode(reader, reader.uint32(), undefined, _depth + 1, message.options);
                        continue;
                    }
                case 6: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.userPk = value;
                        else
                            delete message.userPk;
                        continue;
                    }
                case 7: {
                        if (wireType !== 2)
                            break;
                        message.optionalDestination = reader.string();
                        message._optionalDestination = "optionalDestination";
                        continue;
                    }
                case 8: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.id = value;
                        else
                            delete message.id;
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            return message;
        };

        /**
         * Decodes a TrasnactionInstruction message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.TrasnactionInstruction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.TrasnactionInstruction & streaming.TrasnactionInstruction.$Shape} TrasnactionInstruction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TrasnactionInstruction.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TrasnactionInstruction message.
         * @function verify
         * @memberof streaming.TrasnactionInstruction
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TrasnactionInstruction.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            var properties = {};
            if (message.inputMint != null && message.hasOwnProperty("inputMint"))
                if (!$util.isString(message.inputMint))
                    return "inputMint: string expected";
            if (message.outputMint != null && message.hasOwnProperty("outputMint"))
                if (!$util.isString(message.outputMint))
                    return "outputMint: string expected";
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (!$util.isInteger(message.amount) && !(message.amount && $util.isInteger(message.amount.low) && $util.isInteger(message.amount.high)))
                    return "amount: integer|Long expected";
            if (message.slippageBps != null && message.hasOwnProperty("slippageBps"))
                if (!$util.isInteger(message.slippageBps))
                    return "slippageBps: integer expected";
            if (message.options != null && message.hasOwnProperty("options")) {
                var error = $root.streaming.QuoteOptions.verify(message.options, _depth + 1);
                if (error)
                    return "options." + error;
            }
            if (message.userPk != null && message.hasOwnProperty("userPk"))
                if (!$util.isString(message.userPk))
                    return "userPk: string expected";
            if (message.optionalDestination != null && message.hasOwnProperty("optionalDestination")) {
                properties._optionalDestination = 1;
                if (!$util.isString(message.optionalDestination))
                    return "optionalDestination: string expected";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            return null;
        };

        /**
         * Creates a TrasnactionInstruction message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof streaming.TrasnactionInstruction
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {streaming.TrasnactionInstruction} TrasnactionInstruction
         */
        TrasnactionInstruction.fromObject = function fromObject(object, _depth) {
            if (object instanceof $root.streaming.TrasnactionInstruction)
                return object;
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            var message = new $root.streaming.TrasnactionInstruction();
            if (object.inputMint != null)
                if (typeof object.inputMint !== "string" || object.inputMint.length)
                    message.inputMint = String(object.inputMint);
            if (object.outputMint != null)
                if (typeof object.outputMint !== "string" || object.outputMint.length)
                    message.outputMint = String(object.outputMint);
            if (object.amount != null)
                if (typeof object.amount === "object" ? object.amount.low || object.amount.high : Number(object.amount) !== 0)
                    if ($util.Long)
                        (message.amount = $util.Long.fromValue(object.amount)).unsigned = true;
                    else if (typeof object.amount === "string")
                        message.amount = parseInt(object.amount, 10);
                    else if (typeof object.amount === "number")
                        message.amount = object.amount;
                    else if (typeof object.amount === "object")
                        message.amount = new $util.LongBits(object.amount.low >>> 0, object.amount.high >>> 0).toNumber(true);
            if (object.slippageBps != null)
                if (Number(object.slippageBps) !== 0)
                    message.slippageBps = object.slippageBps >>> 0;
            if (object.options != null) {
                if (typeof object.options !== "object")
                    throw TypeError(".streaming.TrasnactionInstruction.options: object expected");
                message.options = $root.streaming.QuoteOptions.fromObject(object.options, _depth + 1);
            }
            if (object.userPk != null)
                if (typeof object.userPk !== "string" || object.userPk.length)
                    message.userPk = String(object.userPk);
            if (object.optionalDestination != null)
                message.optionalDestination = String(object.optionalDestination);
            if (object.id != null)
                if (typeof object.id !== "string" || object.id.length)
                    message.id = String(object.id);
            return message;
        };

        /**
         * Creates a plain object from a TrasnactionInstruction message. Also converts values to other types if specified.
         * @function toObject
         * @memberof streaming.TrasnactionInstruction
         * @static
         * @param {streaming.TrasnactionInstruction} message TrasnactionInstruction
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TrasnactionInstruction.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.inputMint = "";
                object.outputMint = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.amount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.amount = options.longs === String ? "0" : 0;
                object.slippageBps = 0;
                object.options = null;
                object.userPk = "";
                object.id = "";
            }
            if (message.inputMint != null && message.hasOwnProperty("inputMint"))
                object.inputMint = message.inputMint;
            if (message.outputMint != null && message.hasOwnProperty("outputMint"))
                object.outputMint = message.outputMint;
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (typeof message.amount === "number")
                    object.amount = options.longs === String ? String(message.amount) : message.amount;
                else
                    object.amount = options.longs === String ? $util.Long.prototype.toString.call(message.amount) : options.longs === Number ? new $util.LongBits(message.amount.low >>> 0, message.amount.high >>> 0).toNumber(true) : message.amount;
            if (message.slippageBps != null && message.hasOwnProperty("slippageBps"))
                object.slippageBps = message.slippageBps;
            if (message.options != null && message.hasOwnProperty("options"))
                object.options = $root.streaming.QuoteOptions.toObject(message.options, options);
            if (message.userPk != null && message.hasOwnProperty("userPk"))
                object.userPk = message.userPk;
            if (message.optionalDestination != null && message.hasOwnProperty("optionalDestination")) {
                object.optionalDestination = message.optionalDestination;
                if (options.oneofs)
                    object._optionalDestination = "optionalDestination";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            return object;
        };

        /**
         * Converts this TrasnactionInstruction to JSON.
         * @function toJSON
         * @memberof streaming.TrasnactionInstruction
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TrasnactionInstruction.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for TrasnactionInstruction
         * @function getTypeUrl
         * @memberof streaming.TrasnactionInstruction
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        TrasnactionInstruction.getTypeUrl = function getTypeUrl(prefix) {
            if (prefix === undefined)
                prefix = "type.googleapis.com";
            return prefix + "/streaming.TrasnactionInstruction";
        };

        return TrasnactionInstruction;
    })();

    streaming.QuoteOptions = (function() {

        /**
         * Properties of a QuoteOptions.
         * @typedef {Object} streaming.QuoteOptions.$Properties
         * @property {number|null} [swapMode] QuoteOptions swapMode
         * @property {Array.<string>|null} [dexes] QuoteOptions dexes
         * @property {Array.<string>|null} [excludeDexes] QuoteOptions excludeDexes
         * @property {boolean|null} [dynamicSlippage] QuoteOptions dynamicSlippage
         * @property {boolean|null} [restrictIntermediateTokens] QuoteOptions restrictIntermediateTokens
         * @property {boolean|null} [onlyDirectRoutes] QuoteOptions onlyDirectRoutes
         * @property {boolean|null} [asLegacyTransaction] QuoteOptions asLegacyTransaction
         * @property {number|null} [maxAccounts] QuoteOptions maxAccounts
         * @property {number|null} [blockhashSlotsToExpiry] QuoteOptions blockhashSlotsToExpiry
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a QuoteOptions.
         * @memberof streaming
         * @interface IQuoteOptions
         * @augments streaming.QuoteOptions.$Properties
         * @deprecated Use streaming.QuoteOptions.$Properties instead.
         */

        /**
         * Shape of a QuoteOptions.
         * @typedef {streaming.QuoteOptions.$Properties} streaming.QuoteOptions.$Shape
         */

        /**
         * Constructs a new QuoteOptions.
         * @memberof streaming
         * @classdesc Represents a QuoteOptions.
         * @constructor
         * @param {streaming.QuoteOptions.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        function QuoteOptions(properties) {
            this.dexes = [];
            this.excludeDexes = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * QuoteOptions swapMode.
         * @member {number|null|undefined} swapMode
         * @memberof streaming.QuoteOptions
         * @instance
         */
        QuoteOptions.prototype.swapMode = null;

        /**
         * QuoteOptions dexes.
         * @member {Array.<string>} dexes
         * @memberof streaming.QuoteOptions
         * @instance
         */
        QuoteOptions.prototype.dexes = $util.emptyArray;

        /**
         * QuoteOptions excludeDexes.
         * @member {Array.<string>} excludeDexes
         * @memberof streaming.QuoteOptions
         * @instance
         */
        QuoteOptions.prototype.excludeDexes = $util.emptyArray;

        /**
         * QuoteOptions dynamicSlippage.
         * @member {boolean|null|undefined} dynamicSlippage
         * @memberof streaming.QuoteOptions
         * @instance
         */
        QuoteOptions.prototype.dynamicSlippage = null;

        /**
         * QuoteOptions restrictIntermediateTokens.
         * @member {boolean|null|undefined} restrictIntermediateTokens
         * @memberof streaming.QuoteOptions
         * @instance
         */
        QuoteOptions.prototype.restrictIntermediateTokens = null;

        /**
         * QuoteOptions onlyDirectRoutes.
         * @member {boolean|null|undefined} onlyDirectRoutes
         * @memberof streaming.QuoteOptions
         * @instance
         */
        QuoteOptions.prototype.onlyDirectRoutes = null;

        /**
         * QuoteOptions asLegacyTransaction.
         * @member {boolean|null|undefined} asLegacyTransaction
         * @memberof streaming.QuoteOptions
         * @instance
         */
        QuoteOptions.prototype.asLegacyTransaction = null;

        /**
         * QuoteOptions maxAccounts.
         * @member {number|null|undefined} maxAccounts
         * @memberof streaming.QuoteOptions
         * @instance
         */
        QuoteOptions.prototype.maxAccounts = null;

        /**
         * QuoteOptions blockhashSlotsToExpiry.
         * @member {number|null|undefined} blockhashSlotsToExpiry
         * @memberof streaming.QuoteOptions
         * @instance
         */
        QuoteOptions.prototype.blockhashSlotsToExpiry = null;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(QuoteOptions.prototype, "_swapMode", {
            get: $util.oneOfGetter($oneOfFields = ["swapMode"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(QuoteOptions.prototype, "_dynamicSlippage", {
            get: $util.oneOfGetter($oneOfFields = ["dynamicSlippage"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(QuoteOptions.prototype, "_restrictIntermediateTokens", {
            get: $util.oneOfGetter($oneOfFields = ["restrictIntermediateTokens"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(QuoteOptions.prototype, "_onlyDirectRoutes", {
            get: $util.oneOfGetter($oneOfFields = ["onlyDirectRoutes"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(QuoteOptions.prototype, "_asLegacyTransaction", {
            get: $util.oneOfGetter($oneOfFields = ["asLegacyTransaction"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(QuoteOptions.prototype, "_maxAccounts", {
            get: $util.oneOfGetter($oneOfFields = ["maxAccounts"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(QuoteOptions.prototype, "_blockhashSlotsToExpiry", {
            get: $util.oneOfGetter($oneOfFields = ["blockhashSlotsToExpiry"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new QuoteOptions instance using the specified properties.
         * @function create
         * @memberof streaming.QuoteOptions
         * @static
         * @param {streaming.QuoteOptions.$Properties=} [properties] Properties to set
         * @returns {streaming.QuoteOptions} QuoteOptions instance
         * @type {{
         *   (properties: streaming.QuoteOptions.$Shape): streaming.QuoteOptions & streaming.QuoteOptions.$Shape;
         *   (properties?: streaming.QuoteOptions.$Properties): streaming.QuoteOptions;
         * }}
         */
        QuoteOptions.create = function create(properties) {
            return new QuoteOptions(properties);
        };

        /**
         * Encodes the specified QuoteOptions message. Does not implicitly {@link streaming.QuoteOptions.verify|verify} messages.
         * @function encode
         * @memberof streaming.QuoteOptions
         * @static
         * @param {streaming.QuoteOptions.$Properties} message QuoteOptions message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QuoteOptions.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.swapMode != null && Object.hasOwnProperty.call(message, "swapMode"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.swapMode);
            if (message.dexes != null && message.dexes.length)
                for (var i = 0; i < message.dexes.length; ++i)
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.dexes[i]);
            if (message.excludeDexes != null && message.excludeDexes.length)
                for (var i = 0; i < message.excludeDexes.length; ++i)
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.excludeDexes[i]);
            if (message.dynamicSlippage != null && Object.hasOwnProperty.call(message, "dynamicSlippage"))
                writer.uint32(/* id 4, wireType 0 =*/32).bool(message.dynamicSlippage);
            if (message.restrictIntermediateTokens != null && Object.hasOwnProperty.call(message, "restrictIntermediateTokens"))
                writer.uint32(/* id 5, wireType 0 =*/40).bool(message.restrictIntermediateTokens);
            if (message.onlyDirectRoutes != null && Object.hasOwnProperty.call(message, "onlyDirectRoutes"))
                writer.uint32(/* id 6, wireType 0 =*/48).bool(message.onlyDirectRoutes);
            if (message.asLegacyTransaction != null && Object.hasOwnProperty.call(message, "asLegacyTransaction"))
                writer.uint32(/* id 7, wireType 0 =*/56).bool(message.asLegacyTransaction);
            if (message.maxAccounts != null && Object.hasOwnProperty.call(message, "maxAccounts"))
                writer.uint32(/* id 8, wireType 0 =*/64).uint32(message.maxAccounts);
            if (message.blockhashSlotsToExpiry != null && Object.hasOwnProperty.call(message, "blockhashSlotsToExpiry"))
                writer.uint32(/* id 9, wireType 0 =*/72).uint32(message.blockhashSlotsToExpiry);
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (var i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified QuoteOptions message, length delimited. Does not implicitly {@link streaming.QuoteOptions.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.QuoteOptions
         * @static
         * @param {streaming.QuoteOptions.$Properties} message QuoteOptions message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QuoteOptions.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a QuoteOptions message from the specified reader or buffer.
         * @function decode
         * @memberof streaming.QuoteOptions
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {streaming.QuoteOptions & streaming.QuoteOptions.$Shape} QuoteOptions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QuoteOptions.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            var end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.streaming.QuoteOptions();
            while (reader.pos < end) {
                var start = reader.pos;
                var tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                var wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 0)
                            break;
                        message.swapMode = reader.uint32();
                        message._swapMode = "swapMode";
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        if (!(message.dexes && message.dexes.length))
                            message.dexes = [];
                        message.dexes.push(reader.string());
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        if (!(message.excludeDexes && message.excludeDexes.length))
                            message.excludeDexes = [];
                        message.excludeDexes.push(reader.string());
                        continue;
                    }
                case 4: {
                        if (wireType !== 0)
                            break;
                        message.dynamicSlippage = reader.bool();
                        message._dynamicSlippage = "dynamicSlippage";
                        continue;
                    }
                case 5: {
                        if (wireType !== 0)
                            break;
                        message.restrictIntermediateTokens = reader.bool();
                        message._restrictIntermediateTokens = "restrictIntermediateTokens";
                        continue;
                    }
                case 6: {
                        if (wireType !== 0)
                            break;
                        message.onlyDirectRoutes = reader.bool();
                        message._onlyDirectRoutes = "onlyDirectRoutes";
                        continue;
                    }
                case 7: {
                        if (wireType !== 0)
                            break;
                        message.asLegacyTransaction = reader.bool();
                        message._asLegacyTransaction = "asLegacyTransaction";
                        continue;
                    }
                case 8: {
                        if (wireType !== 0)
                            break;
                        message.maxAccounts = reader.uint32();
                        message._maxAccounts = "maxAccounts";
                        continue;
                    }
                case 9: {
                        if (wireType !== 0)
                            break;
                        message.blockhashSlotsToExpiry = reader.uint32();
                        message._blockhashSlotsToExpiry = "blockhashSlotsToExpiry";
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            return message;
        };

        /**
         * Decodes a QuoteOptions message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.QuoteOptions
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.QuoteOptions & streaming.QuoteOptions.$Shape} QuoteOptions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QuoteOptions.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a QuoteOptions message.
         * @function verify
         * @memberof streaming.QuoteOptions
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        QuoteOptions.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            var properties = {};
            if (message.swapMode != null && message.hasOwnProperty("swapMode")) {
                properties._swapMode = 1;
                if (!$util.isInteger(message.swapMode))
                    return "swapMode: integer expected";
            }
            if (message.dexes != null && message.hasOwnProperty("dexes")) {
                if (!Array.isArray(message.dexes))
                    return "dexes: array expected";
                for (var i = 0; i < message.dexes.length; ++i)
                    if (!$util.isString(message.dexes[i]))
                        return "dexes: string[] expected";
            }
            if (message.excludeDexes != null && message.hasOwnProperty("excludeDexes")) {
                if (!Array.isArray(message.excludeDexes))
                    return "excludeDexes: array expected";
                for (var i = 0; i < message.excludeDexes.length; ++i)
                    if (!$util.isString(message.excludeDexes[i]))
                        return "excludeDexes: string[] expected";
            }
            if (message.dynamicSlippage != null && message.hasOwnProperty("dynamicSlippage")) {
                properties._dynamicSlippage = 1;
                if (typeof message.dynamicSlippage !== "boolean")
                    return "dynamicSlippage: boolean expected";
            }
            if (message.restrictIntermediateTokens != null && message.hasOwnProperty("restrictIntermediateTokens")) {
                properties._restrictIntermediateTokens = 1;
                if (typeof message.restrictIntermediateTokens !== "boolean")
                    return "restrictIntermediateTokens: boolean expected";
            }
            if (message.onlyDirectRoutes != null && message.hasOwnProperty("onlyDirectRoutes")) {
                properties._onlyDirectRoutes = 1;
                if (typeof message.onlyDirectRoutes !== "boolean")
                    return "onlyDirectRoutes: boolean expected";
            }
            if (message.asLegacyTransaction != null && message.hasOwnProperty("asLegacyTransaction")) {
                properties._asLegacyTransaction = 1;
                if (typeof message.asLegacyTransaction !== "boolean")
                    return "asLegacyTransaction: boolean expected";
            }
            if (message.maxAccounts != null && message.hasOwnProperty("maxAccounts")) {
                properties._maxAccounts = 1;
                if (!$util.isInteger(message.maxAccounts))
                    return "maxAccounts: integer expected";
            }
            if (message.blockhashSlotsToExpiry != null && message.hasOwnProperty("blockhashSlotsToExpiry")) {
                properties._blockhashSlotsToExpiry = 1;
                if (!$util.isInteger(message.blockhashSlotsToExpiry))
                    return "blockhashSlotsToExpiry: integer expected";
            }
            return null;
        };

        /**
         * Creates a QuoteOptions message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof streaming.QuoteOptions
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {streaming.QuoteOptions} QuoteOptions
         */
        QuoteOptions.fromObject = function fromObject(object, _depth) {
            if (object instanceof $root.streaming.QuoteOptions)
                return object;
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            var message = new $root.streaming.QuoteOptions();
            if (object.swapMode != null)
                message.swapMode = object.swapMode >>> 0;
            if (object.dexes) {
                if (!Array.isArray(object.dexes))
                    throw TypeError(".streaming.QuoteOptions.dexes: array expected");
                message.dexes = Array(object.dexes.length);
                for (var i = 0; i < object.dexes.length; ++i)
                    message.dexes[i] = String(object.dexes[i]);
            }
            if (object.excludeDexes) {
                if (!Array.isArray(object.excludeDexes))
                    throw TypeError(".streaming.QuoteOptions.excludeDexes: array expected");
                message.excludeDexes = Array(object.excludeDexes.length);
                for (var i = 0; i < object.excludeDexes.length; ++i)
                    message.excludeDexes[i] = String(object.excludeDexes[i]);
            }
            if (object.dynamicSlippage != null)
                message.dynamicSlippage = Boolean(object.dynamicSlippage);
            if (object.restrictIntermediateTokens != null)
                message.restrictIntermediateTokens = Boolean(object.restrictIntermediateTokens);
            if (object.onlyDirectRoutes != null)
                message.onlyDirectRoutes = Boolean(object.onlyDirectRoutes);
            if (object.asLegacyTransaction != null)
                message.asLegacyTransaction = Boolean(object.asLegacyTransaction);
            if (object.maxAccounts != null)
                message.maxAccounts = object.maxAccounts >>> 0;
            if (object.blockhashSlotsToExpiry != null)
                message.blockhashSlotsToExpiry = object.blockhashSlotsToExpiry >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a QuoteOptions message. Also converts values to other types if specified.
         * @function toObject
         * @memberof streaming.QuoteOptions
         * @static
         * @param {streaming.QuoteOptions} message QuoteOptions
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        QuoteOptions.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.dexes = [];
                object.excludeDexes = [];
            }
            if (message.swapMode != null && message.hasOwnProperty("swapMode")) {
                object.swapMode = message.swapMode;
                if (options.oneofs)
                    object._swapMode = "swapMode";
            }
            if (message.dexes && message.dexes.length) {
                object.dexes = Array(message.dexes.length);
                for (var j = 0; j < message.dexes.length; ++j)
                    object.dexes[j] = message.dexes[j];
            }
            if (message.excludeDexes && message.excludeDexes.length) {
                object.excludeDexes = Array(message.excludeDexes.length);
                for (var j = 0; j < message.excludeDexes.length; ++j)
                    object.excludeDexes[j] = message.excludeDexes[j];
            }
            if (message.dynamicSlippage != null && message.hasOwnProperty("dynamicSlippage")) {
                object.dynamicSlippage = message.dynamicSlippage;
                if (options.oneofs)
                    object._dynamicSlippage = "dynamicSlippage";
            }
            if (message.restrictIntermediateTokens != null && message.hasOwnProperty("restrictIntermediateTokens")) {
                object.restrictIntermediateTokens = message.restrictIntermediateTokens;
                if (options.oneofs)
                    object._restrictIntermediateTokens = "restrictIntermediateTokens";
            }
            if (message.onlyDirectRoutes != null && message.hasOwnProperty("onlyDirectRoutes")) {
                object.onlyDirectRoutes = message.onlyDirectRoutes;
                if (options.oneofs)
                    object._onlyDirectRoutes = "onlyDirectRoutes";
            }
            if (message.asLegacyTransaction != null && message.hasOwnProperty("asLegacyTransaction")) {
                object.asLegacyTransaction = message.asLegacyTransaction;
                if (options.oneofs)
                    object._asLegacyTransaction = "asLegacyTransaction";
            }
            if (message.maxAccounts != null && message.hasOwnProperty("maxAccounts")) {
                object.maxAccounts = message.maxAccounts;
                if (options.oneofs)
                    object._maxAccounts = "maxAccounts";
            }
            if (message.blockhashSlotsToExpiry != null && message.hasOwnProperty("blockhashSlotsToExpiry")) {
                object.blockhashSlotsToExpiry = message.blockhashSlotsToExpiry;
                if (options.oneofs)
                    object._blockhashSlotsToExpiry = "blockhashSlotsToExpiry";
            }
            return object;
        };

        /**
         * Converts this QuoteOptions to JSON.
         * @function toJSON
         * @memberof streaming.QuoteOptions
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        QuoteOptions.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for QuoteOptions
         * @function getTypeUrl
         * @memberof streaming.QuoteOptions
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        QuoteOptions.getTypeUrl = function getTypeUrl(prefix) {
            if (prefix === undefined)
                prefix = "type.googleapis.com";
            return prefix + "/streaming.QuoteOptions";
        };

        return QuoteOptions;
    })();

    streaming.Empty = (function() {

        /**
         * Properties of an Empty.
         * @typedef {Object} streaming.Empty.$Properties
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of an Empty.
         * @memberof streaming
         * @interface IEmpty
         * @augments streaming.Empty.$Properties
         * @deprecated Use streaming.Empty.$Properties instead.
         */

        /**
         * Shape of an Empty.
         * @typedef {streaming.Empty.$Properties} streaming.Empty.$Shape
         */

        /**
         * Constructs a new Empty.
         * @memberof streaming
         * @classdesc Represents an Empty.
         * @constructor
         * @param {streaming.Empty.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        function Empty(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Creates a new Empty instance using the specified properties.
         * @function create
         * @memberof streaming.Empty
         * @static
         * @param {streaming.Empty.$Properties=} [properties] Properties to set
         * @returns {streaming.Empty} Empty instance
         * @type {{
         *   (properties: streaming.Empty.$Shape): streaming.Empty & streaming.Empty.$Shape;
         *   (properties?: streaming.Empty.$Properties): streaming.Empty;
         * }}
         */
        Empty.create = function create(properties) {
            return new Empty(properties);
        };

        /**
         * Encodes the specified Empty message. Does not implicitly {@link streaming.Empty.verify|verify} messages.
         * @function encode
         * @memberof streaming.Empty
         * @static
         * @param {streaming.Empty.$Properties} message Empty message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Empty.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (var i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified Empty message, length delimited. Does not implicitly {@link streaming.Empty.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.Empty
         * @static
         * @param {streaming.Empty.$Properties} message Empty message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Empty.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Empty message from the specified reader or buffer.
         * @function decode
         * @memberof streaming.Empty
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {streaming.Empty & streaming.Empty.$Shape} Empty
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Empty.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            var end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.streaming.Empty();
            while (reader.pos < end) {
                var start = reader.pos;
                var tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                reader.skipType(tag & 7, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            return message;
        };

        /**
         * Decodes an Empty message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.Empty
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.Empty & streaming.Empty.$Shape} Empty
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Empty.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Empty message.
         * @function verify
         * @memberof streaming.Empty
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Empty.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            return null;
        };

        /**
         * Creates an Empty message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof streaming.Empty
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {streaming.Empty} Empty
         */
        Empty.fromObject = function fromObject(object, _depth) {
            if (object instanceof $root.streaming.Empty)
                return object;
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            return new $root.streaming.Empty();
        };

        /**
         * Creates a plain object from an Empty message. Also converts values to other types if specified.
         * @function toObject
         * @memberof streaming.Empty
         * @static
         * @param {streaming.Empty} message Empty
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Empty.toObject = function toObject() {
            return {};
        };

        /**
         * Converts this Empty to JSON.
         * @function toJSON
         * @memberof streaming.Empty
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Empty.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for Empty
         * @function getTypeUrl
         * @memberof streaming.Empty
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        Empty.getTypeUrl = function getTypeUrl(prefix) {
            if (prefix === undefined)
                prefix = "type.googleapis.com";
            return prefix + "/streaming.Empty";
        };

        return Empty;
    })();

    streaming.CoinsData = (function() {

        /**
         * Properties of a CoinsData.
         * @typedef {Object} streaming.CoinsData.$Properties
         * @property {string|null} [price] CoinsData price
         * @property {string|null} [changePercent] CoinsData changePercent
         * @property {string|null} [imageUrl] CoinsData imageUrl
         * @property {number|null} [rank] CoinsData rank
         * @property {string|null} [coinName] CoinsData coinName
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a CoinsData.
         * @memberof streaming
         * @interface ICoinsData
         * @augments streaming.CoinsData.$Properties
         * @deprecated Use streaming.CoinsData.$Properties instead.
         */

        /**
         * Shape of a CoinsData.
         * @typedef {streaming.CoinsData.$Properties} streaming.CoinsData.$Shape
         */

        /**
         * Constructs a new CoinsData.
         * @memberof streaming
         * @classdesc Represents a CoinsData.
         * @constructor
         * @param {streaming.CoinsData.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        function CoinsData(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CoinsData price.
         * @member {string} price
         * @memberof streaming.CoinsData
         * @instance
         */
        CoinsData.prototype.price = "";

        /**
         * CoinsData changePercent.
         * @member {string} changePercent
         * @memberof streaming.CoinsData
         * @instance
         */
        CoinsData.prototype.changePercent = "";

        /**
         * CoinsData imageUrl.
         * @member {string} imageUrl
         * @memberof streaming.CoinsData
         * @instance
         */
        CoinsData.prototype.imageUrl = "";

        /**
         * CoinsData rank.
         * @member {number|null|undefined} rank
         * @memberof streaming.CoinsData
         * @instance
         */
        CoinsData.prototype.rank = null;

        /**
         * CoinsData coinName.
         * @member {string} coinName
         * @memberof streaming.CoinsData
         * @instance
         */
        CoinsData.prototype.coinName = "";

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(CoinsData.prototype, "_rank", {
            get: $util.oneOfGetter($oneOfFields = ["rank"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new CoinsData instance using the specified properties.
         * @function create
         * @memberof streaming.CoinsData
         * @static
         * @param {streaming.CoinsData.$Properties=} [properties] Properties to set
         * @returns {streaming.CoinsData} CoinsData instance
         * @type {{
         *   (properties: streaming.CoinsData.$Shape): streaming.CoinsData & streaming.CoinsData.$Shape;
         *   (properties?: streaming.CoinsData.$Properties): streaming.CoinsData;
         * }}
         */
        CoinsData.create = function create(properties) {
            return new CoinsData(properties);
        };

        /**
         * Encodes the specified CoinsData message. Does not implicitly {@link streaming.CoinsData.verify|verify} messages.
         * @function encode
         * @memberof streaming.CoinsData
         * @static
         * @param {streaming.CoinsData.$Properties} message CoinsData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CoinsData.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.price != null && Object.hasOwnProperty.call(message, "price"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.price);
            if (message.changePercent != null && Object.hasOwnProperty.call(message, "changePercent"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.changePercent);
            if (message.imageUrl != null && Object.hasOwnProperty.call(message, "imageUrl"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.imageUrl);
            if (message.rank != null && Object.hasOwnProperty.call(message, "rank"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.rank);
            if (message.coinName != null && Object.hasOwnProperty.call(message, "coinName"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.coinName);
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (var i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified CoinsData message, length delimited. Does not implicitly {@link streaming.CoinsData.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.CoinsData
         * @static
         * @param {streaming.CoinsData.$Properties} message CoinsData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CoinsData.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CoinsData message from the specified reader or buffer.
         * @function decode
         * @memberof streaming.CoinsData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {streaming.CoinsData & streaming.CoinsData.$Shape} CoinsData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CoinsData.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            var end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.streaming.CoinsData(), value;
            while (reader.pos < end) {
                var start = reader.pos;
                var tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                var wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.price = value;
                        else
                            delete message.price;
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.changePercent = value;
                        else
                            delete message.changePercent;
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.imageUrl = value;
                        else
                            delete message.imageUrl;
                        continue;
                    }
                case 4: {
                        if (wireType !== 0)
                            break;
                        message.rank = reader.uint32();
                        message._rank = "rank";
                        continue;
                    }
                case 5: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.coinName = value;
                        else
                            delete message.coinName;
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            return message;
        };

        /**
         * Decodes a CoinsData message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.CoinsData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.CoinsData & streaming.CoinsData.$Shape} CoinsData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CoinsData.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CoinsData message.
         * @function verify
         * @memberof streaming.CoinsData
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CoinsData.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            var properties = {};
            if (message.price != null && message.hasOwnProperty("price"))
                if (!$util.isString(message.price))
                    return "price: string expected";
            if (message.changePercent != null && message.hasOwnProperty("changePercent"))
                if (!$util.isString(message.changePercent))
                    return "changePercent: string expected";
            if (message.imageUrl != null && message.hasOwnProperty("imageUrl"))
                if (!$util.isString(message.imageUrl))
                    return "imageUrl: string expected";
            if (message.rank != null && message.hasOwnProperty("rank")) {
                properties._rank = 1;
                if (!$util.isInteger(message.rank))
                    return "rank: integer expected";
            }
            if (message.coinName != null && message.hasOwnProperty("coinName"))
                if (!$util.isString(message.coinName))
                    return "coinName: string expected";
            return null;
        };

        /**
         * Creates a CoinsData message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof streaming.CoinsData
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {streaming.CoinsData} CoinsData
         */
        CoinsData.fromObject = function fromObject(object, _depth) {
            if (object instanceof $root.streaming.CoinsData)
                return object;
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            var message = new $root.streaming.CoinsData();
            if (object.price != null)
                if (typeof object.price !== "string" || object.price.length)
                    message.price = String(object.price);
            if (object.changePercent != null)
                if (typeof object.changePercent !== "string" || object.changePercent.length)
                    message.changePercent = String(object.changePercent);
            if (object.imageUrl != null)
                if (typeof object.imageUrl !== "string" || object.imageUrl.length)
                    message.imageUrl = String(object.imageUrl);
            if (object.rank != null)
                message.rank = object.rank >>> 0;
            if (object.coinName != null)
                if (typeof object.coinName !== "string" || object.coinName.length)
                    message.coinName = String(object.coinName);
            return message;
        };

        /**
         * Creates a plain object from a CoinsData message. Also converts values to other types if specified.
         * @function toObject
         * @memberof streaming.CoinsData
         * @static
         * @param {streaming.CoinsData} message CoinsData
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CoinsData.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.price = "";
                object.changePercent = "";
                object.imageUrl = "";
                object.coinName = "";
            }
            if (message.price != null && message.hasOwnProperty("price"))
                object.price = message.price;
            if (message.changePercent != null && message.hasOwnProperty("changePercent"))
                object.changePercent = message.changePercent;
            if (message.imageUrl != null && message.hasOwnProperty("imageUrl"))
                object.imageUrl = message.imageUrl;
            if (message.rank != null && message.hasOwnProperty("rank")) {
                object.rank = message.rank;
                if (options.oneofs)
                    object._rank = "rank";
            }
            if (message.coinName != null && message.hasOwnProperty("coinName"))
                object.coinName = message.coinName;
            return object;
        };

        /**
         * Converts this CoinsData to JSON.
         * @function toJSON
         * @memberof streaming.CoinsData
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CoinsData.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for CoinsData
         * @function getTypeUrl
         * @memberof streaming.CoinsData
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        CoinsData.getTypeUrl = function getTypeUrl(prefix) {
            if (prefix === undefined)
                prefix = "type.googleapis.com";
            return prefix + "/streaming.CoinsData";
        };

        return CoinsData;
    })();

    streaming.AddBundlesRequest = (function() {

        /**
         * Properties of an AddBundlesRequest.
         * @typedef {Object} streaming.AddBundlesRequest.$Properties
         * @property {Array.<string>|null} [bundleIds] AddBundlesRequest bundleIds
         * @property {string|null} [userId] AddBundlesRequest userId
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of an AddBundlesRequest.
         * @memberof streaming
         * @interface IAddBundlesRequest
         * @augments streaming.AddBundlesRequest.$Properties
         * @deprecated Use streaming.AddBundlesRequest.$Properties instead.
         */

        /**
         * Shape of an AddBundlesRequest.
         * @typedef {streaming.AddBundlesRequest.$Properties} streaming.AddBundlesRequest.$Shape
         */

        /**
         * Constructs a new AddBundlesRequest.
         * @memberof streaming
         * @classdesc Represents an AddBundlesRequest.
         * @constructor
         * @param {streaming.AddBundlesRequest.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        function AddBundlesRequest(properties) {
            this.bundleIds = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * AddBundlesRequest bundleIds.
         * @member {Array.<string>} bundleIds
         * @memberof streaming.AddBundlesRequest
         * @instance
         */
        AddBundlesRequest.prototype.bundleIds = $util.emptyArray;

        /**
         * AddBundlesRequest userId.
         * @member {string} userId
         * @memberof streaming.AddBundlesRequest
         * @instance
         */
        AddBundlesRequest.prototype.userId = "";

        /**
         * Creates a new AddBundlesRequest instance using the specified properties.
         * @function create
         * @memberof streaming.AddBundlesRequest
         * @static
         * @param {streaming.AddBundlesRequest.$Properties=} [properties] Properties to set
         * @returns {streaming.AddBundlesRequest} AddBundlesRequest instance
         * @type {{
         *   (properties: streaming.AddBundlesRequest.$Shape): streaming.AddBundlesRequest & streaming.AddBundlesRequest.$Shape;
         *   (properties?: streaming.AddBundlesRequest.$Properties): streaming.AddBundlesRequest;
         * }}
         */
        AddBundlesRequest.create = function create(properties) {
            return new AddBundlesRequest(properties);
        };

        /**
         * Encodes the specified AddBundlesRequest message. Does not implicitly {@link streaming.AddBundlesRequest.verify|verify} messages.
         * @function encode
         * @memberof streaming.AddBundlesRequest
         * @static
         * @param {streaming.AddBundlesRequest.$Properties} message AddBundlesRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AddBundlesRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.bundleIds != null && message.bundleIds.length)
                for (var i = 0; i < message.bundleIds.length; ++i)
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.bundleIds[i]);
            if (message.userId != null && Object.hasOwnProperty.call(message, "userId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.userId);
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (var i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified AddBundlesRequest message, length delimited. Does not implicitly {@link streaming.AddBundlesRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.AddBundlesRequest
         * @static
         * @param {streaming.AddBundlesRequest.$Properties} message AddBundlesRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AddBundlesRequest.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an AddBundlesRequest message from the specified reader or buffer.
         * @function decode
         * @memberof streaming.AddBundlesRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {streaming.AddBundlesRequest & streaming.AddBundlesRequest.$Shape} AddBundlesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AddBundlesRequest.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            var end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.streaming.AddBundlesRequest(), value;
            while (reader.pos < end) {
                var start = reader.pos;
                var tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                var wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if (!(message.bundleIds && message.bundleIds.length))
                            message.bundleIds = [];
                        message.bundleIds.push(reader.string());
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.userId = value;
                        else
                            delete message.userId;
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            return message;
        };

        /**
         * Decodes an AddBundlesRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.AddBundlesRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.AddBundlesRequest & streaming.AddBundlesRequest.$Shape} AddBundlesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AddBundlesRequest.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an AddBundlesRequest message.
         * @function verify
         * @memberof streaming.AddBundlesRequest
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        AddBundlesRequest.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.bundleIds != null && message.hasOwnProperty("bundleIds")) {
                if (!Array.isArray(message.bundleIds))
                    return "bundleIds: array expected";
                for (var i = 0; i < message.bundleIds.length; ++i)
                    if (!$util.isString(message.bundleIds[i]))
                        return "bundleIds: string[] expected";
            }
            if (message.userId != null && message.hasOwnProperty("userId"))
                if (!$util.isString(message.userId))
                    return "userId: string expected";
            return null;
        };

        /**
         * Creates an AddBundlesRequest message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof streaming.AddBundlesRequest
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {streaming.AddBundlesRequest} AddBundlesRequest
         */
        AddBundlesRequest.fromObject = function fromObject(object, _depth) {
            if (object instanceof $root.streaming.AddBundlesRequest)
                return object;
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            var message = new $root.streaming.AddBundlesRequest();
            if (object.bundleIds) {
                if (!Array.isArray(object.bundleIds))
                    throw TypeError(".streaming.AddBundlesRequest.bundleIds: array expected");
                message.bundleIds = Array(object.bundleIds.length);
                for (var i = 0; i < object.bundleIds.length; ++i)
                    message.bundleIds[i] = String(object.bundleIds[i]);
            }
            if (object.userId != null)
                if (typeof object.userId !== "string" || object.userId.length)
                    message.userId = String(object.userId);
            return message;
        };

        /**
         * Creates a plain object from an AddBundlesRequest message. Also converts values to other types if specified.
         * @function toObject
         * @memberof streaming.AddBundlesRequest
         * @static
         * @param {streaming.AddBundlesRequest} message AddBundlesRequest
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AddBundlesRequest.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.bundleIds = [];
            if (options.defaults)
                object.userId = "";
            if (message.bundleIds && message.bundleIds.length) {
                object.bundleIds = Array(message.bundleIds.length);
                for (var j = 0; j < message.bundleIds.length; ++j)
                    object.bundleIds[j] = message.bundleIds[j];
            }
            if (message.userId != null && message.hasOwnProperty("userId"))
                object.userId = message.userId;
            return object;
        };

        /**
         * Converts this AddBundlesRequest to JSON.
         * @function toJSON
         * @memberof streaming.AddBundlesRequest
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AddBundlesRequest.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for AddBundlesRequest
         * @function getTypeUrl
         * @memberof streaming.AddBundlesRequest
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        AddBundlesRequest.getTypeUrl = function getTypeUrl(prefix) {
            if (prefix === undefined)
                prefix = "type.googleapis.com";
            return prefix + "/streaming.AddBundlesRequest";
        };

        return AddBundlesRequest;
    })();

    streaming.UserBundleUpdate = (function() {

        /**
         * Properties of a UserBundleUpdate.
         * @typedef {Object} streaming.UserBundleUpdate.$Properties
         * @property {string|null} [bundleId] UserBundleUpdate bundleId
         * @property {string|null} [oldStatus] UserBundleUpdate oldStatus
         * @property {streaming.BundleStage|null} [newStatus] UserBundleUpdate newStatus
         * @property {number|Long|null} [timestamp] UserBundleUpdate timestamp
         * @property {number|Long|null} [slot] UserBundleUpdate slot
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */

        /**
         * Properties of a UserBundleUpdate.
         * @memberof streaming
         * @interface IUserBundleUpdate
         * @augments streaming.UserBundleUpdate.$Properties
         * @deprecated Use streaming.UserBundleUpdate.$Properties instead.
         */

        /**
         * Shape of a UserBundleUpdate.
         * @typedef {streaming.UserBundleUpdate.$Properties} streaming.UserBundleUpdate.$Shape
         */

        /**
         * Constructs a new UserBundleUpdate.
         * @memberof streaming
         * @classdesc Represents a UserBundleUpdate.
         * @constructor
         * @param {streaming.UserBundleUpdate.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding
         */
        function UserBundleUpdate(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UserBundleUpdate bundleId.
         * @member {string} bundleId
         * @memberof streaming.UserBundleUpdate
         * @instance
         */
        UserBundleUpdate.prototype.bundleId = "";

        /**
         * UserBundleUpdate oldStatus.
         * @member {string} oldStatus
         * @memberof streaming.UserBundleUpdate
         * @instance
         */
        UserBundleUpdate.prototype.oldStatus = "";

        /**
         * UserBundleUpdate newStatus.
         * @member {streaming.BundleStage} newStatus
         * @memberof streaming.UserBundleUpdate
         * @instance
         */
        UserBundleUpdate.prototype.newStatus = 0;

        /**
         * UserBundleUpdate timestamp.
         * @member {number|Long} timestamp
         * @memberof streaming.UserBundleUpdate
         * @instance
         */
        UserBundleUpdate.prototype.timestamp = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * UserBundleUpdate slot.
         * @member {number|Long|null|undefined} slot
         * @memberof streaming.UserBundleUpdate
         * @instance
         */
        UserBundleUpdate.prototype.slot = null;

        // OneOf field names bound to virtual getters and setters
        var $oneOfFields;

        // Virtual OneOf for proto3 optional field
        Object.defineProperty(UserBundleUpdate.prototype, "_slot", {
            get: $util.oneOfGetter($oneOfFields = ["slot"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        /**
         * Creates a new UserBundleUpdate instance using the specified properties.
         * @function create
         * @memberof streaming.UserBundleUpdate
         * @static
         * @param {streaming.UserBundleUpdate.$Properties=} [properties] Properties to set
         * @returns {streaming.UserBundleUpdate} UserBundleUpdate instance
         * @type {{
         *   (properties: streaming.UserBundleUpdate.$Shape): streaming.UserBundleUpdate & streaming.UserBundleUpdate.$Shape;
         *   (properties?: streaming.UserBundleUpdate.$Properties): streaming.UserBundleUpdate;
         * }}
         */
        UserBundleUpdate.create = function create(properties) {
            return new UserBundleUpdate(properties);
        };

        /**
         * Encodes the specified UserBundleUpdate message. Does not implicitly {@link streaming.UserBundleUpdate.verify|verify} messages.
         * @function encode
         * @memberof streaming.UserBundleUpdate
         * @static
         * @param {streaming.UserBundleUpdate.$Properties} message UserBundleUpdate message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UserBundleUpdate.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.bundleId != null && Object.hasOwnProperty.call(message, "bundleId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.bundleId);
            if (message.oldStatus != null && Object.hasOwnProperty.call(message, "oldStatus"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.oldStatus);
            if (message.newStatus != null && Object.hasOwnProperty.call(message, "newStatus"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.newStatus);
            if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.timestamp);
            if (message.slot != null && Object.hasOwnProperty.call(message, "slot"))
                writer.uint32(/* id 5, wireType 0 =*/40).uint64(message.slot);
            if (message.$unknowns != null && Object.hasOwnProperty.call(message, "$unknowns"))
                for (var i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified UserBundleUpdate message, length delimited. Does not implicitly {@link streaming.UserBundleUpdate.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.UserBundleUpdate
         * @static
         * @param {streaming.UserBundleUpdate.$Properties} message UserBundleUpdate message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UserBundleUpdate.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a UserBundleUpdate message from the specified reader or buffer.
         * @function decode
         * @memberof streaming.UserBundleUpdate
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {streaming.UserBundleUpdate & streaming.UserBundleUpdate.$Shape} UserBundleUpdate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UserBundleUpdate.decode = function decode(reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw Error("max depth exceeded");
            var end = length === undefined ? reader.len : reader.pos + length, message = _target || new $root.streaming.UserBundleUpdate(), value;
            while (reader.pos < end) {
                var start = reader.pos;
                var tag = reader.tag();
                if (tag === _end) {
                    _end = undefined;
                    break;
                }
                var wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.bundleId = value;
                        else
                            delete message.bundleId;
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        if ((value = reader.string()).length)
                            message.oldStatus = value;
                        else
                            delete message.oldStatus;
                        continue;
                    }
                case 3: {
                        if (wireType !== 0)
                            break;
                        if (value = reader.int32())
                            message.newStatus = value;
                        else
                            delete message.newStatus;
                        continue;
                    }
                case 4: {
                        if (wireType !== 0)
                            break;
                        if (typeof (value = reader.uint64()) === "object" ? value.low || value.high : value !== 0)
                            message.timestamp = value;
                        else
                            delete message.timestamp;
                        continue;
                    }
                case 5: {
                        if (wireType !== 0)
                            break;
                        message.slot = reader.uint64();
                        message._slot = "slot";
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                $util.makeProp(message, "$unknowns", false);
                (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
            }
            if (_end !== undefined)
                throw Error("missing end group");
            return message;
        };

        /**
         * Decodes a UserBundleUpdate message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.UserBundleUpdate
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.UserBundleUpdate & streaming.UserBundleUpdate.$Shape} UserBundleUpdate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UserBundleUpdate.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a UserBundleUpdate message.
         * @function verify
         * @memberof streaming.UserBundleUpdate
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UserBundleUpdate.verify = function verify(message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            var properties = {};
            if (message.bundleId != null && message.hasOwnProperty("bundleId"))
                if (!$util.isString(message.bundleId))
                    return "bundleId: string expected";
            if (message.oldStatus != null && message.hasOwnProperty("oldStatus"))
                if (!$util.isString(message.oldStatus))
                    return "oldStatus: string expected";
            if (message.newStatus != null && message.hasOwnProperty("newStatus"))
                switch (message.newStatus) {
                default:
                    return "newStatus: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    break;
                }
            if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                    return "timestamp: integer|Long expected";
            if (message.slot != null && message.hasOwnProperty("slot")) {
                properties._slot = 1;
                if (!$util.isInteger(message.slot) && !(message.slot && $util.isInteger(message.slot.low) && $util.isInteger(message.slot.high)))
                    return "slot: integer|Long expected";
            }
            return null;
        };

        /**
         * Creates a UserBundleUpdate message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof streaming.UserBundleUpdate
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {streaming.UserBundleUpdate} UserBundleUpdate
         */
        UserBundleUpdate.fromObject = function fromObject(object, _depth) {
            if (object instanceof $root.streaming.UserBundleUpdate)
                return object;
            if (_depth === undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw Error("max depth exceeded");
            var message = new $root.streaming.UserBundleUpdate();
            if (object.bundleId != null)
                if (typeof object.bundleId !== "string" || object.bundleId.length)
                    message.bundleId = String(object.bundleId);
            if (object.oldStatus != null)
                if (typeof object.oldStatus !== "string" || object.oldStatus.length)
                    message.oldStatus = String(object.oldStatus);
            if (object.newStatus !== 0 && (typeof object.newStatus !== "string" || $root.streaming.BundleStage[object.newStatus] !== 0))
                switch (object.newStatus) {
                default:
                    if (typeof object.newStatus === "number") {
                        message.newStatus = object.newStatus;
                        break;
                    }
                    break;
                case "BUNDLE_STAGE_UNSPECIFIED":
                case 0:
                    message.newStatus = 0;
                    break;
                case "BUNDLE_STAGE_SUBMITTED":
                case 1:
                    message.newStatus = 1;
                    break;
                case "BUNDLE_STAGE_IN_FLIGHT":
                case 2:
                    message.newStatus = 2;
                    break;
                case "BUNDLE_STAGE_LANDED":
                case 3:
                    message.newStatus = 3;
                    break;
                case "BUNDLE_STAGE_CONFIRMED":
                case 4:
                    message.newStatus = 4;
                    break;
                case "BUNDLE_STAGE_FINALIZED":
                case 5:
                    message.newStatus = 5;
                    break;
                case "BUNDLE_STAGE_FAILED":
                case 6:
                    message.newStatus = 6;
                    break;
                }
            if (object.timestamp != null)
                if (typeof object.timestamp === "object" ? object.timestamp.low || object.timestamp.high : Number(object.timestamp) !== 0)
                    if ($util.Long)
                        (message.timestamp = $util.Long.fromValue(object.timestamp)).unsigned = true;
                    else if (typeof object.timestamp === "string")
                        message.timestamp = parseInt(object.timestamp, 10);
                    else if (typeof object.timestamp === "number")
                        message.timestamp = object.timestamp;
                    else if (typeof object.timestamp === "object")
                        message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber(true);
            if (object.slot != null)
                if ($util.Long)
                    (message.slot = $util.Long.fromValue(object.slot)).unsigned = true;
                else if (typeof object.slot === "string")
                    message.slot = parseInt(object.slot, 10);
                else if (typeof object.slot === "number")
                    message.slot = object.slot;
                else if (typeof object.slot === "object")
                    message.slot = new $util.LongBits(object.slot.low >>> 0, object.slot.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a UserBundleUpdate message. Also converts values to other types if specified.
         * @function toObject
         * @memberof streaming.UserBundleUpdate
         * @static
         * @param {streaming.UserBundleUpdate} message UserBundleUpdate
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UserBundleUpdate.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.bundleId = "";
                object.oldStatus = "";
                object.newStatus = options.enums === String ? "BUNDLE_STAGE_UNSPECIFIED" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.timestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.timestamp = options.longs === String ? "0" : 0;
            }
            if (message.bundleId != null && message.hasOwnProperty("bundleId"))
                object.bundleId = message.bundleId;
            if (message.oldStatus != null && message.hasOwnProperty("oldStatus"))
                object.oldStatus = message.oldStatus;
            if (message.newStatus != null && message.hasOwnProperty("newStatus"))
                object.newStatus = options.enums === String ? $root.streaming.BundleStage[message.newStatus] === undefined ? message.newStatus : $root.streaming.BundleStage[message.newStatus] : message.newStatus;
            if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                if (typeof message.timestamp === "number")
                    object.timestamp = options.longs === String ? String(message.timestamp) : message.timestamp;
                else
                    object.timestamp = options.longs === String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber(true) : message.timestamp;
            if (message.slot != null && message.hasOwnProperty("slot")) {
                if (typeof message.slot === "number")
                    object.slot = options.longs === String ? String(message.slot) : message.slot;
                else
                    object.slot = options.longs === String ? $util.Long.prototype.toString.call(message.slot) : options.longs === Number ? new $util.LongBits(message.slot.low >>> 0, message.slot.high >>> 0).toNumber(true) : message.slot;
                if (options.oneofs)
                    object._slot = "slot";
            }
            return object;
        };

        /**
         * Converts this UserBundleUpdate to JSON.
         * @function toJSON
         * @memberof streaming.UserBundleUpdate
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UserBundleUpdate.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for UserBundleUpdate
         * @function getTypeUrl
         * @memberof streaming.UserBundleUpdate
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        UserBundleUpdate.getTypeUrl = function getTypeUrl(prefix) {
            if (prefix === undefined)
                prefix = "type.googleapis.com";
            return prefix + "/streaming.UserBundleUpdate";
        };

        return UserBundleUpdate;
    })();

    /**
     * BundleStage enum.
     * @name streaming.BundleStage
     * @enum {number}
     * @property {number} BUNDLE_STAGE_UNSPECIFIED=0 BUNDLE_STAGE_UNSPECIFIED value
     * @property {number} BUNDLE_STAGE_SUBMITTED=1 BUNDLE_STAGE_SUBMITTED value
     * @property {number} BUNDLE_STAGE_IN_FLIGHT=2 BUNDLE_STAGE_IN_FLIGHT value
     * @property {number} BUNDLE_STAGE_LANDED=3 BUNDLE_STAGE_LANDED value
     * @property {number} BUNDLE_STAGE_CONFIRMED=4 BUNDLE_STAGE_CONFIRMED value
     * @property {number} BUNDLE_STAGE_FINALIZED=5 BUNDLE_STAGE_FINALIZED value
     * @property {number} BUNDLE_STAGE_FAILED=6 BUNDLE_STAGE_FAILED value
     */
    streaming.BundleStage = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "BUNDLE_STAGE_UNSPECIFIED"] = 0;
        values[valuesById[1] = "BUNDLE_STAGE_SUBMITTED"] = 1;
        values[valuesById[2] = "BUNDLE_STAGE_IN_FLIGHT"] = 2;
        values[valuesById[3] = "BUNDLE_STAGE_LANDED"] = 3;
        values[valuesById[4] = "BUNDLE_STAGE_CONFIRMED"] = 4;
        values[valuesById[5] = "BUNDLE_STAGE_FINALIZED"] = 5;
        values[valuesById[6] = "BUNDLE_STAGE_FAILED"] = 6;
        return values;
    })();

    return streaming;
})();

module.exports = $root;
