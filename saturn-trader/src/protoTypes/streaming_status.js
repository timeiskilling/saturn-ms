/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const streaming = $root.streaming = (() => {

    /**
     * Namespace streaming.
     * @exports streaming
     * @namespace
     */
    const streaming = {};

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

        return BundleService;
    })();

    streaming.SignedTransactions = (function() {

        /**
         * Properties of a SignedTransactions.
         * @memberof streaming
         * @interface ISignedTransactions
         * @property {Array.<string>|null} [transactions] SignedTransactions transactions
         * @property {string|null} [userPk] SignedTransactions userPk
         */

        /**
         * Constructs a new SignedTransactions.
         * @memberof streaming
         * @classdesc Represents a SignedTransactions.
         * @implements ISignedTransactions
         * @constructor
         * @param {streaming.ISignedTransactions=} [properties] Properties to set
         */
        function SignedTransactions(properties) {
            this.transactions = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
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
         * @param {streaming.ISignedTransactions=} [properties] Properties to set
         * @returns {streaming.SignedTransactions} SignedTransactions instance
         */
        SignedTransactions.create = function create(properties) {
            return new SignedTransactions(properties);
        };

        /**
         * Encodes the specified SignedTransactions message. Does not implicitly {@link streaming.SignedTransactions.verify|verify} messages.
         * @function encode
         * @memberof streaming.SignedTransactions
         * @static
         * @param {streaming.ISignedTransactions} message SignedTransactions message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SignedTransactions.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.transactions != null && message.transactions.length)
                for (let i = 0; i < message.transactions.length; ++i)
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.transactions[i]);
            if (message.userPk != null && Object.hasOwnProperty.call(message, "userPk"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.userPk);
            return writer;
        };

        /**
         * Encodes the specified SignedTransactions message, length delimited. Does not implicitly {@link streaming.SignedTransactions.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.SignedTransactions
         * @static
         * @param {streaming.ISignedTransactions} message SignedTransactions message or plain object to encode
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
         * @returns {streaming.SignedTransactions} SignedTransactions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SignedTransactions.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.streaming.SignedTransactions();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.transactions && message.transactions.length))
                            message.transactions = [];
                        message.transactions.push(reader.string());
                        break;
                    }
                case 2: {
                        message.userPk = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a SignedTransactions message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.SignedTransactions
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.SignedTransactions} SignedTransactions
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
        SignedTransactions.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.transactions != null && message.hasOwnProperty("transactions")) {
                if (!Array.isArray(message.transactions))
                    return "transactions: array expected";
                for (let i = 0; i < message.transactions.length; ++i)
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
        SignedTransactions.fromObject = function fromObject(object) {
            if (object instanceof $root.streaming.SignedTransactions)
                return object;
            let message = new $root.streaming.SignedTransactions();
            if (object.transactions) {
                if (!Array.isArray(object.transactions))
                    throw TypeError(".streaming.SignedTransactions.transactions: array expected");
                message.transactions = [];
                for (let i = 0; i < object.transactions.length; ++i)
                    message.transactions[i] = String(object.transactions[i]);
            }
            if (object.userPk != null)
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
            let object = {};
            if (options.arrays || options.defaults)
                object.transactions = [];
            if (options.defaults)
                object.userPk = "";
            if (message.transactions && message.transactions.length) {
                object.transactions = [];
                for (let j = 0; j < message.transactions.length; ++j)
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
         * Gets the default type url for SignedTransactions
         * @function getTypeUrl
         * @memberof streaming.SignedTransactions
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        SignedTransactions.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/streaming.SignedTransactions";
        };

        return SignedTransactions;
    })();

    streaming.BuiltTransaction = (function() {

        /**
         * Properties of a BuiltTransaction.
         * @memberof streaming
         * @interface IBuiltTransaction
         * @property {string|null} [id] BuiltTransaction id
         * @property {string|null} [transactionBase58] BuiltTransaction transactionBase58
         */

        /**
         * Constructs a new BuiltTransaction.
         * @memberof streaming
         * @classdesc Represents a BuiltTransaction.
         * @implements IBuiltTransaction
         * @constructor
         * @param {streaming.IBuiltTransaction=} [properties] Properties to set
         */
        function BuiltTransaction(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
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
         * @param {streaming.IBuiltTransaction=} [properties] Properties to set
         * @returns {streaming.BuiltTransaction} BuiltTransaction instance
         */
        BuiltTransaction.create = function create(properties) {
            return new BuiltTransaction(properties);
        };

        /**
         * Encodes the specified BuiltTransaction message. Does not implicitly {@link streaming.BuiltTransaction.verify|verify} messages.
         * @function encode
         * @memberof streaming.BuiltTransaction
         * @static
         * @param {streaming.IBuiltTransaction} message BuiltTransaction message or plain object to encode
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
            return writer;
        };

        /**
         * Encodes the specified BuiltTransaction message, length delimited. Does not implicitly {@link streaming.BuiltTransaction.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.BuiltTransaction
         * @static
         * @param {streaming.IBuiltTransaction} message BuiltTransaction message or plain object to encode
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
         * @returns {streaming.BuiltTransaction} BuiltTransaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BuiltTransaction.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.streaming.BuiltTransaction();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.string();
                        break;
                    }
                case 2: {
                        message.transactionBase58 = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a BuiltTransaction message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.BuiltTransaction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.BuiltTransaction} BuiltTransaction
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
        BuiltTransaction.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
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
        BuiltTransaction.fromObject = function fromObject(object) {
            if (object instanceof $root.streaming.BuiltTransaction)
                return object;
            let message = new $root.streaming.BuiltTransaction();
            if (object.id != null)
                message.id = String(object.id);
            if (object.transactionBase58 != null)
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
            let object = {};
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
         * Gets the default type url for BuiltTransaction
         * @function getTypeUrl
         * @memberof streaming.BuiltTransaction
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        BuiltTransaction.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/streaming.BuiltTransaction";
        };

        return BuiltTransaction;
    })();

    streaming.TransactionsToSign = (function() {

        /**
         * Properties of a TransactionsToSign.
         * @memberof streaming
         * @interface ITransactionsToSign
         * @property {Array.<streaming.IBuiltTransaction>|null} [transactions] TransactionsToSign transactions
         * @property {streaming.IBundleDelta|null} [delta] TransactionsToSign delta
         */

        /**
         * Constructs a new TransactionsToSign.
         * @memberof streaming
         * @classdesc Represents a TransactionsToSign.
         * @implements ITransactionsToSign
         * @constructor
         * @param {streaming.ITransactionsToSign=} [properties] Properties to set
         */
        function TransactionsToSign(properties) {
            this.transactions = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TransactionsToSign transactions.
         * @member {Array.<streaming.IBuiltTransaction>} transactions
         * @memberof streaming.TransactionsToSign
         * @instance
         */
        TransactionsToSign.prototype.transactions = $util.emptyArray;

        /**
         * TransactionsToSign delta.
         * @member {streaming.IBundleDelta|null|undefined} delta
         * @memberof streaming.TransactionsToSign
         * @instance
         */
        TransactionsToSign.prototype.delta = null;

        /**
         * Creates a new TransactionsToSign instance using the specified properties.
         * @function create
         * @memberof streaming.TransactionsToSign
         * @static
         * @param {streaming.ITransactionsToSign=} [properties] Properties to set
         * @returns {streaming.TransactionsToSign} TransactionsToSign instance
         */
        TransactionsToSign.create = function create(properties) {
            return new TransactionsToSign(properties);
        };

        /**
         * Encodes the specified TransactionsToSign message. Does not implicitly {@link streaming.TransactionsToSign.verify|verify} messages.
         * @function encode
         * @memberof streaming.TransactionsToSign
         * @static
         * @param {streaming.ITransactionsToSign} message TransactionsToSign message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TransactionsToSign.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.transactions != null && message.transactions.length)
                for (let i = 0; i < message.transactions.length; ++i)
                    $root.streaming.BuiltTransaction.encode(message.transactions[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.delta != null && Object.hasOwnProperty.call(message, "delta"))
                $root.streaming.BundleDelta.encode(message.delta, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified TransactionsToSign message, length delimited. Does not implicitly {@link streaming.TransactionsToSign.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.TransactionsToSign
         * @static
         * @param {streaming.ITransactionsToSign} message TransactionsToSign message or plain object to encode
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
         * @returns {streaming.TransactionsToSign} TransactionsToSign
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TransactionsToSign.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.streaming.TransactionsToSign();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.transactions && message.transactions.length))
                            message.transactions = [];
                        message.transactions.push($root.streaming.BuiltTransaction.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.delta = $root.streaming.BundleDelta.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TransactionsToSign message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.TransactionsToSign
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.TransactionsToSign} TransactionsToSign
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
        TransactionsToSign.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.transactions != null && message.hasOwnProperty("transactions")) {
                if (!Array.isArray(message.transactions))
                    return "transactions: array expected";
                for (let i = 0; i < message.transactions.length; ++i) {
                    let error = $root.streaming.BuiltTransaction.verify(message.transactions[i]);
                    if (error)
                        return "transactions." + error;
                }
            }
            if (message.delta != null && message.hasOwnProperty("delta")) {
                let error = $root.streaming.BundleDelta.verify(message.delta);
                if (error)
                    return "delta." + error;
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
        TransactionsToSign.fromObject = function fromObject(object) {
            if (object instanceof $root.streaming.TransactionsToSign)
                return object;
            let message = new $root.streaming.TransactionsToSign();
            if (object.transactions) {
                if (!Array.isArray(object.transactions))
                    throw TypeError(".streaming.TransactionsToSign.transactions: array expected");
                message.transactions = [];
                for (let i = 0; i < object.transactions.length; ++i) {
                    if (typeof object.transactions[i] !== "object")
                        throw TypeError(".streaming.TransactionsToSign.transactions: object expected");
                    message.transactions[i] = $root.streaming.BuiltTransaction.fromObject(object.transactions[i]);
                }
            }
            if (object.delta != null) {
                if (typeof object.delta !== "object")
                    throw TypeError(".streaming.TransactionsToSign.delta: object expected");
                message.delta = $root.streaming.BundleDelta.fromObject(object.delta);
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
            let object = {};
            if (options.arrays || options.defaults)
                object.transactions = [];
            if (options.defaults)
                object.delta = null;
            if (message.transactions && message.transactions.length) {
                object.transactions = [];
                for (let j = 0; j < message.transactions.length; ++j)
                    object.transactions[j] = $root.streaming.BuiltTransaction.toObject(message.transactions[j], options);
            }
            if (message.delta != null && message.hasOwnProperty("delta"))
                object.delta = $root.streaming.BundleDelta.toObject(message.delta, options);
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
         * Gets the default type url for TransactionsToSign
         * @function getTypeUrl
         * @memberof streaming.TransactionsToSign
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TransactionsToSign.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/streaming.TransactionsToSign";
        };

        return TransactionsToSign;
    })();

    streaming.BundleDelta = (function() {

        /**
         * Properties of a BundleDelta.
         * @memberof streaming
         * @interface IBundleDelta
         * @property {Array.<streaming.ITransactionDelta>|null} [swaps] BundleDelta swaps
         * @property {number|Long|null} [jitoTipLamports] BundleDelta jitoTipLamports
         * @property {number|Long|null} [totalNetworkFeeLamports] BundleDelta totalNetworkFeeLamports
         */

        /**
         * Constructs a new BundleDelta.
         * @memberof streaming
         * @classdesc Represents a BundleDelta.
         * @implements IBundleDelta
         * @constructor
         * @param {streaming.IBundleDelta=} [properties] Properties to set
         */
        function BundleDelta(properties) {
            this.swaps = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * BundleDelta swaps.
         * @member {Array.<streaming.ITransactionDelta>} swaps
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
         * @param {streaming.IBundleDelta=} [properties] Properties to set
         * @returns {streaming.BundleDelta} BundleDelta instance
         */
        BundleDelta.create = function create(properties) {
            return new BundleDelta(properties);
        };

        /**
         * Encodes the specified BundleDelta message. Does not implicitly {@link streaming.BundleDelta.verify|verify} messages.
         * @function encode
         * @memberof streaming.BundleDelta
         * @static
         * @param {streaming.IBundleDelta} message BundleDelta message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        BundleDelta.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.swaps != null && message.swaps.length)
                for (let i = 0; i < message.swaps.length; ++i)
                    $root.streaming.TransactionDelta.encode(message.swaps[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.jitoTipLamports != null && Object.hasOwnProperty.call(message, "jitoTipLamports"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.jitoTipLamports);
            if (message.totalNetworkFeeLamports != null && Object.hasOwnProperty.call(message, "totalNetworkFeeLamports"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.totalNetworkFeeLamports);
            return writer;
        };

        /**
         * Encodes the specified BundleDelta message, length delimited. Does not implicitly {@link streaming.BundleDelta.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.BundleDelta
         * @static
         * @param {streaming.IBundleDelta} message BundleDelta message or plain object to encode
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
         * @returns {streaming.BundleDelta} BundleDelta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        BundleDelta.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.streaming.BundleDelta();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.swaps && message.swaps.length))
                            message.swaps = [];
                        message.swaps.push($root.streaming.TransactionDelta.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.jitoTipLamports = reader.uint64();
                        break;
                    }
                case 3: {
                        message.totalNetworkFeeLamports = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a BundleDelta message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.BundleDelta
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.BundleDelta} BundleDelta
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
        BundleDelta.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.swaps != null && message.hasOwnProperty("swaps")) {
                if (!Array.isArray(message.swaps))
                    return "swaps: array expected";
                for (let i = 0; i < message.swaps.length; ++i) {
                    let error = $root.streaming.TransactionDelta.verify(message.swaps[i]);
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
        BundleDelta.fromObject = function fromObject(object) {
            if (object instanceof $root.streaming.BundleDelta)
                return object;
            let message = new $root.streaming.BundleDelta();
            if (object.swaps) {
                if (!Array.isArray(object.swaps))
                    throw TypeError(".streaming.BundleDelta.swaps: array expected");
                message.swaps = [];
                for (let i = 0; i < object.swaps.length; ++i) {
                    if (typeof object.swaps[i] !== "object")
                        throw TypeError(".streaming.BundleDelta.swaps: object expected");
                    message.swaps[i] = $root.streaming.TransactionDelta.fromObject(object.swaps[i]);
                }
            }
            if (object.jitoTipLamports != null)
                if ($util.Long)
                    (message.jitoTipLamports = $util.Long.fromValue(object.jitoTipLamports)).unsigned = true;
                else if (typeof object.jitoTipLamports === "string")
                    message.jitoTipLamports = parseInt(object.jitoTipLamports, 10);
                else if (typeof object.jitoTipLamports === "number")
                    message.jitoTipLamports = object.jitoTipLamports;
                else if (typeof object.jitoTipLamports === "object")
                    message.jitoTipLamports = new $util.LongBits(object.jitoTipLamports.low >>> 0, object.jitoTipLamports.high >>> 0).toNumber(true);
            if (object.totalNetworkFeeLamports != null)
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
            let object = {};
            if (options.arrays || options.defaults)
                object.swaps = [];
            if (options.defaults) {
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.jitoTipLamports = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.jitoTipLamports = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.totalNetworkFeeLamports = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.totalNetworkFeeLamports = options.longs === String ? "0" : 0;
            }
            if (message.swaps && message.swaps.length) {
                object.swaps = [];
                for (let j = 0; j < message.swaps.length; ++j)
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
         * Gets the default type url for BundleDelta
         * @function getTypeUrl
         * @memberof streaming.BundleDelta
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        BundleDelta.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/streaming.BundleDelta";
        };

        return BundleDelta;
    })();

    streaming.TransactionsBuld = (function() {

        /**
         * Properties of a TransactionsBuld.
         * @memberof streaming
         * @interface ITransactionsBuld
         * @property {Array.<streaming.ITrasnactionInstruction>|null} [transactions] TransactionsBuld transactions
         */

        /**
         * Constructs a new TransactionsBuld.
         * @memberof streaming
         * @classdesc Represents a TransactionsBuld.
         * @implements ITransactionsBuld
         * @constructor
         * @param {streaming.ITransactionsBuld=} [properties] Properties to set
         */
        function TransactionsBuld(properties) {
            this.transactions = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TransactionsBuld transactions.
         * @member {Array.<streaming.ITrasnactionInstruction>} transactions
         * @memberof streaming.TransactionsBuld
         * @instance
         */
        TransactionsBuld.prototype.transactions = $util.emptyArray;

        /**
         * Creates a new TransactionsBuld instance using the specified properties.
         * @function create
         * @memberof streaming.TransactionsBuld
         * @static
         * @param {streaming.ITransactionsBuld=} [properties] Properties to set
         * @returns {streaming.TransactionsBuld} TransactionsBuld instance
         */
        TransactionsBuld.create = function create(properties) {
            return new TransactionsBuld(properties);
        };

        /**
         * Encodes the specified TransactionsBuld message. Does not implicitly {@link streaming.TransactionsBuld.verify|verify} messages.
         * @function encode
         * @memberof streaming.TransactionsBuld
         * @static
         * @param {streaming.ITransactionsBuld} message TransactionsBuld message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TransactionsBuld.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.transactions != null && message.transactions.length)
                for (let i = 0; i < message.transactions.length; ++i)
                    $root.streaming.TrasnactionInstruction.encode(message.transactions[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified TransactionsBuld message, length delimited. Does not implicitly {@link streaming.TransactionsBuld.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.TransactionsBuld
         * @static
         * @param {streaming.ITransactionsBuld} message TransactionsBuld message or plain object to encode
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
         * @returns {streaming.TransactionsBuld} TransactionsBuld
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TransactionsBuld.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.streaming.TransactionsBuld();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.transactions && message.transactions.length))
                            message.transactions = [];
                        message.transactions.push($root.streaming.TrasnactionInstruction.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TransactionsBuld message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.TransactionsBuld
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.TransactionsBuld} TransactionsBuld
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
        TransactionsBuld.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.transactions != null && message.hasOwnProperty("transactions")) {
                if (!Array.isArray(message.transactions))
                    return "transactions: array expected";
                for (let i = 0; i < message.transactions.length; ++i) {
                    let error = $root.streaming.TrasnactionInstruction.verify(message.transactions[i]);
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
        TransactionsBuld.fromObject = function fromObject(object) {
            if (object instanceof $root.streaming.TransactionsBuld)
                return object;
            let message = new $root.streaming.TransactionsBuld();
            if (object.transactions) {
                if (!Array.isArray(object.transactions))
                    throw TypeError(".streaming.TransactionsBuld.transactions: array expected");
                message.transactions = [];
                for (let i = 0; i < object.transactions.length; ++i) {
                    if (typeof object.transactions[i] !== "object")
                        throw TypeError(".streaming.TransactionsBuld.transactions: object expected");
                    message.transactions[i] = $root.streaming.TrasnactionInstruction.fromObject(object.transactions[i]);
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
            let object = {};
            if (options.arrays || options.defaults)
                object.transactions = [];
            if (message.transactions && message.transactions.length) {
                object.transactions = [];
                for (let j = 0; j < message.transactions.length; ++j)
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
         * Gets the default type url for TransactionsBuld
         * @function getTypeUrl
         * @memberof streaming.TransactionsBuld
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TransactionsBuld.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/streaming.TransactionsBuld";
        };

        return TransactionsBuld;
    })();

    streaming.TransactionDelta = (function() {

        /**
         * Properties of a TransactionDelta.
         * @memberof streaming
         * @interface ITransactionDelta
         * @property {string|null} [inputMint] TransactionDelta inputMint
         * @property {number|Long|null} [inputAmount] TransactionDelta inputAmount
         * @property {string|null} [outputMint] TransactionDelta outputMint
         * @property {number|Long|null} [expectedOutput] TransactionDelta expectedOutput
         * @property {number|Long|null} [minimumOutput] TransactionDelta minimumOutput
         * @property {number|Long|null} [jitoTipLamports] TransactionDelta jitoTipLamports
         * @property {number|Long|null} [networkFeeLamports] TransactionDelta networkFeeLamports
         * @property {number|null} [platformFeeBps] TransactionDelta platformFeeBps
         * @property {string|null} [id] TransactionDelta id
         */

        /**
         * Constructs a new TransactionDelta.
         * @memberof streaming
         * @classdesc Represents a TransactionDelta.
         * @implements ITransactionDelta
         * @constructor
         * @param {streaming.ITransactionDelta=} [properties] Properties to set
         */
        function TransactionDelta(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
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
         * @param {streaming.ITransactionDelta=} [properties] Properties to set
         * @returns {streaming.TransactionDelta} TransactionDelta instance
         */
        TransactionDelta.create = function create(properties) {
            return new TransactionDelta(properties);
        };

        /**
         * Encodes the specified TransactionDelta message. Does not implicitly {@link streaming.TransactionDelta.verify|verify} messages.
         * @function encode
         * @memberof streaming.TransactionDelta
         * @static
         * @param {streaming.ITransactionDelta} message TransactionDelta message or plain object to encode
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
            return writer;
        };

        /**
         * Encodes the specified TransactionDelta message, length delimited. Does not implicitly {@link streaming.TransactionDelta.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.TransactionDelta
         * @static
         * @param {streaming.ITransactionDelta} message TransactionDelta message or plain object to encode
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
         * @returns {streaming.TransactionDelta} TransactionDelta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TransactionDelta.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.streaming.TransactionDelta();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.inputMint = reader.string();
                        break;
                    }
                case 2: {
                        message.inputAmount = reader.uint64();
                        break;
                    }
                case 3: {
                        message.outputMint = reader.string();
                        break;
                    }
                case 4: {
                        message.expectedOutput = reader.uint64();
                        break;
                    }
                case 5: {
                        message.minimumOutput = reader.uint64();
                        break;
                    }
                case 6: {
                        message.jitoTipLamports = reader.uint64();
                        break;
                    }
                case 7: {
                        message.networkFeeLamports = reader.uint64();
                        break;
                    }
                case 8: {
                        message.platformFeeBps = reader.uint32();
                        break;
                    }
                case 9: {
                        message.id = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TransactionDelta message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.TransactionDelta
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.TransactionDelta} TransactionDelta
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
        TransactionDelta.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
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
        TransactionDelta.fromObject = function fromObject(object) {
            if (object instanceof $root.streaming.TransactionDelta)
                return object;
            let message = new $root.streaming.TransactionDelta();
            if (object.inputMint != null)
                message.inputMint = String(object.inputMint);
            if (object.inputAmount != null)
                if ($util.Long)
                    (message.inputAmount = $util.Long.fromValue(object.inputAmount)).unsigned = true;
                else if (typeof object.inputAmount === "string")
                    message.inputAmount = parseInt(object.inputAmount, 10);
                else if (typeof object.inputAmount === "number")
                    message.inputAmount = object.inputAmount;
                else if (typeof object.inputAmount === "object")
                    message.inputAmount = new $util.LongBits(object.inputAmount.low >>> 0, object.inputAmount.high >>> 0).toNumber(true);
            if (object.outputMint != null)
                message.outputMint = String(object.outputMint);
            if (object.expectedOutput != null)
                if ($util.Long)
                    (message.expectedOutput = $util.Long.fromValue(object.expectedOutput)).unsigned = true;
                else if (typeof object.expectedOutput === "string")
                    message.expectedOutput = parseInt(object.expectedOutput, 10);
                else if (typeof object.expectedOutput === "number")
                    message.expectedOutput = object.expectedOutput;
                else if (typeof object.expectedOutput === "object")
                    message.expectedOutput = new $util.LongBits(object.expectedOutput.low >>> 0, object.expectedOutput.high >>> 0).toNumber(true);
            if (object.minimumOutput != null)
                if ($util.Long)
                    (message.minimumOutput = $util.Long.fromValue(object.minimumOutput)).unsigned = true;
                else if (typeof object.minimumOutput === "string")
                    message.minimumOutput = parseInt(object.minimumOutput, 10);
                else if (typeof object.minimumOutput === "number")
                    message.minimumOutput = object.minimumOutput;
                else if (typeof object.minimumOutput === "object")
                    message.minimumOutput = new $util.LongBits(object.minimumOutput.low >>> 0, object.minimumOutput.high >>> 0).toNumber(true);
            if (object.jitoTipLamports != null)
                if ($util.Long)
                    (message.jitoTipLamports = $util.Long.fromValue(object.jitoTipLamports)).unsigned = true;
                else if (typeof object.jitoTipLamports === "string")
                    message.jitoTipLamports = parseInt(object.jitoTipLamports, 10);
                else if (typeof object.jitoTipLamports === "number")
                    message.jitoTipLamports = object.jitoTipLamports;
                else if (typeof object.jitoTipLamports === "object")
                    message.jitoTipLamports = new $util.LongBits(object.jitoTipLamports.low >>> 0, object.jitoTipLamports.high >>> 0).toNumber(true);
            if (object.networkFeeLamports != null)
                if ($util.Long)
                    (message.networkFeeLamports = $util.Long.fromValue(object.networkFeeLamports)).unsigned = true;
                else if (typeof object.networkFeeLamports === "string")
                    message.networkFeeLamports = parseInt(object.networkFeeLamports, 10);
                else if (typeof object.networkFeeLamports === "number")
                    message.networkFeeLamports = object.networkFeeLamports;
                else if (typeof object.networkFeeLamports === "object")
                    message.networkFeeLamports = new $util.LongBits(object.networkFeeLamports.low >>> 0, object.networkFeeLamports.high >>> 0).toNumber(true);
            if (object.platformFeeBps != null)
                message.platformFeeBps = object.platformFeeBps >>> 0;
            if (object.id != null)
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
            let object = {};
            if (options.defaults) {
                object.inputMint = "";
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.inputAmount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.inputAmount = options.longs === String ? "0" : 0;
                object.outputMint = "";
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.expectedOutput = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.expectedOutput = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.minimumOutput = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.minimumOutput = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.jitoTipLamports = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.jitoTipLamports = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
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
         * Gets the default type url for TransactionDelta
         * @function getTypeUrl
         * @memberof streaming.TransactionDelta
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TransactionDelta.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/streaming.TransactionDelta";
        };

        return TransactionDelta;
    })();

    streaming.TrasnactionInstruction = (function() {

        /**
         * Properties of a TrasnactionInstruction.
         * @memberof streaming
         * @interface ITrasnactionInstruction
         * @property {string|null} [inputMint] TrasnactionInstruction inputMint
         * @property {string|null} [outputMint] TrasnactionInstruction outputMint
         * @property {number|Long|null} [amount] TrasnactionInstruction amount
         * @property {number|null} [slippageBps] TrasnactionInstruction slippageBps
         * @property {streaming.IQuoteOptions|null} [options] TrasnactionInstruction options
         * @property {string|null} [userPk] TrasnactionInstruction userPk
         * @property {string|null} [id] TrasnactionInstruction id
         */

        /**
         * Constructs a new TrasnactionInstruction.
         * @memberof streaming
         * @classdesc Represents a TrasnactionInstruction.
         * @implements ITrasnactionInstruction
         * @constructor
         * @param {streaming.ITrasnactionInstruction=} [properties] Properties to set
         */
        function TrasnactionInstruction(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
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
         * @member {streaming.IQuoteOptions|null|undefined} options
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
         * TrasnactionInstruction id.
         * @member {string} id
         * @memberof streaming.TrasnactionInstruction
         * @instance
         */
        TrasnactionInstruction.prototype.id = "";

        /**
         * Creates a new TrasnactionInstruction instance using the specified properties.
         * @function create
         * @memberof streaming.TrasnactionInstruction
         * @static
         * @param {streaming.ITrasnactionInstruction=} [properties] Properties to set
         * @returns {streaming.TrasnactionInstruction} TrasnactionInstruction instance
         */
        TrasnactionInstruction.create = function create(properties) {
            return new TrasnactionInstruction(properties);
        };

        /**
         * Encodes the specified TrasnactionInstruction message. Does not implicitly {@link streaming.TrasnactionInstruction.verify|verify} messages.
         * @function encode
         * @memberof streaming.TrasnactionInstruction
         * @static
         * @param {streaming.ITrasnactionInstruction} message TrasnactionInstruction message or plain object to encode
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
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.id);
            return writer;
        };

        /**
         * Encodes the specified TrasnactionInstruction message, length delimited. Does not implicitly {@link streaming.TrasnactionInstruction.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.TrasnactionInstruction
         * @static
         * @param {streaming.ITrasnactionInstruction} message TrasnactionInstruction message or plain object to encode
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
         * @returns {streaming.TrasnactionInstruction} TrasnactionInstruction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TrasnactionInstruction.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.streaming.TrasnactionInstruction();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.inputMint = reader.string();
                        break;
                    }
                case 2: {
                        message.outputMint = reader.string();
                        break;
                    }
                case 3: {
                        message.amount = reader.uint64();
                        break;
                    }
                case 4: {
                        message.slippageBps = reader.uint32();
                        break;
                    }
                case 5: {
                        message.options = $root.streaming.QuoteOptions.decode(reader, reader.uint32());
                        break;
                    }
                case 6: {
                        message.userPk = reader.string();
                        break;
                    }
                case 7: {
                        message.id = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TrasnactionInstruction message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.TrasnactionInstruction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.TrasnactionInstruction} TrasnactionInstruction
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
        TrasnactionInstruction.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
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
                let error = $root.streaming.QuoteOptions.verify(message.options);
                if (error)
                    return "options." + error;
            }
            if (message.userPk != null && message.hasOwnProperty("userPk"))
                if (!$util.isString(message.userPk))
                    return "userPk: string expected";
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
        TrasnactionInstruction.fromObject = function fromObject(object) {
            if (object instanceof $root.streaming.TrasnactionInstruction)
                return object;
            let message = new $root.streaming.TrasnactionInstruction();
            if (object.inputMint != null)
                message.inputMint = String(object.inputMint);
            if (object.outputMint != null)
                message.outputMint = String(object.outputMint);
            if (object.amount != null)
                if ($util.Long)
                    (message.amount = $util.Long.fromValue(object.amount)).unsigned = true;
                else if (typeof object.amount === "string")
                    message.amount = parseInt(object.amount, 10);
                else if (typeof object.amount === "number")
                    message.amount = object.amount;
                else if (typeof object.amount === "object")
                    message.amount = new $util.LongBits(object.amount.low >>> 0, object.amount.high >>> 0).toNumber(true);
            if (object.slippageBps != null)
                message.slippageBps = object.slippageBps >>> 0;
            if (object.options != null) {
                if (typeof object.options !== "object")
                    throw TypeError(".streaming.TrasnactionInstruction.options: object expected");
                message.options = $root.streaming.QuoteOptions.fromObject(object.options);
            }
            if (object.userPk != null)
                message.userPk = String(object.userPk);
            if (object.id != null)
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
            let object = {};
            if (options.defaults) {
                object.inputMint = "";
                object.outputMint = "";
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
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
         * Gets the default type url for TrasnactionInstruction
         * @function getTypeUrl
         * @memberof streaming.TrasnactionInstruction
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TrasnactionInstruction.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/streaming.TrasnactionInstruction";
        };

        return TrasnactionInstruction;
    })();

    streaming.QuoteOptions = (function() {

        /**
         * Properties of a QuoteOptions.
         * @memberof streaming
         * @interface IQuoteOptions
         * @property {number|null} [swapMode] QuoteOptions swapMode
         * @property {Array.<string>|null} [dexes] QuoteOptions dexes
         * @property {Array.<string>|null} [excludeDexes] QuoteOptions excludeDexes
         * @property {boolean|null} [dynamicSlippage] QuoteOptions dynamicSlippage
         * @property {boolean|null} [restrictIntermediateTokens] QuoteOptions restrictIntermediateTokens
         * @property {boolean|null} [onlyDirectRoutes] QuoteOptions onlyDirectRoutes
         * @property {boolean|null} [asLegacyTransaction] QuoteOptions asLegacyTransaction
         * @property {number|null} [maxAccounts] QuoteOptions maxAccounts
         */

        /**
         * Constructs a new QuoteOptions.
         * @memberof streaming
         * @classdesc Represents a QuoteOptions.
         * @implements IQuoteOptions
         * @constructor
         * @param {streaming.IQuoteOptions=} [properties] Properties to set
         */
        function QuoteOptions(properties) {
            this.dexes = [];
            this.excludeDexes = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
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

        // OneOf field names bound to virtual getters and setters
        let $oneOfFields;

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

        /**
         * Creates a new QuoteOptions instance using the specified properties.
         * @function create
         * @memberof streaming.QuoteOptions
         * @static
         * @param {streaming.IQuoteOptions=} [properties] Properties to set
         * @returns {streaming.QuoteOptions} QuoteOptions instance
         */
        QuoteOptions.create = function create(properties) {
            return new QuoteOptions(properties);
        };

        /**
         * Encodes the specified QuoteOptions message. Does not implicitly {@link streaming.QuoteOptions.verify|verify} messages.
         * @function encode
         * @memberof streaming.QuoteOptions
         * @static
         * @param {streaming.IQuoteOptions} message QuoteOptions message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QuoteOptions.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.swapMode != null && Object.hasOwnProperty.call(message, "swapMode"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.swapMode);
            if (message.dexes != null && message.dexes.length)
                for (let i = 0; i < message.dexes.length; ++i)
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.dexes[i]);
            if (message.excludeDexes != null && message.excludeDexes.length)
                for (let i = 0; i < message.excludeDexes.length; ++i)
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
            return writer;
        };

        /**
         * Encodes the specified QuoteOptions message, length delimited. Does not implicitly {@link streaming.QuoteOptions.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.QuoteOptions
         * @static
         * @param {streaming.IQuoteOptions} message QuoteOptions message or plain object to encode
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
         * @returns {streaming.QuoteOptions} QuoteOptions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QuoteOptions.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.streaming.QuoteOptions();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.swapMode = reader.uint32();
                        break;
                    }
                case 2: {
                        if (!(message.dexes && message.dexes.length))
                            message.dexes = [];
                        message.dexes.push(reader.string());
                        break;
                    }
                case 3: {
                        if (!(message.excludeDexes && message.excludeDexes.length))
                            message.excludeDexes = [];
                        message.excludeDexes.push(reader.string());
                        break;
                    }
                case 4: {
                        message.dynamicSlippage = reader.bool();
                        break;
                    }
                case 5: {
                        message.restrictIntermediateTokens = reader.bool();
                        break;
                    }
                case 6: {
                        message.onlyDirectRoutes = reader.bool();
                        break;
                    }
                case 7: {
                        message.asLegacyTransaction = reader.bool();
                        break;
                    }
                case 8: {
                        message.maxAccounts = reader.uint32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a QuoteOptions message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.QuoteOptions
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.QuoteOptions} QuoteOptions
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
        QuoteOptions.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
            if (message.swapMode != null && message.hasOwnProperty("swapMode")) {
                properties._swapMode = 1;
                if (!$util.isInteger(message.swapMode))
                    return "swapMode: integer expected";
            }
            if (message.dexes != null && message.hasOwnProperty("dexes")) {
                if (!Array.isArray(message.dexes))
                    return "dexes: array expected";
                for (let i = 0; i < message.dexes.length; ++i)
                    if (!$util.isString(message.dexes[i]))
                        return "dexes: string[] expected";
            }
            if (message.excludeDexes != null && message.hasOwnProperty("excludeDexes")) {
                if (!Array.isArray(message.excludeDexes))
                    return "excludeDexes: array expected";
                for (let i = 0; i < message.excludeDexes.length; ++i)
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
        QuoteOptions.fromObject = function fromObject(object) {
            if (object instanceof $root.streaming.QuoteOptions)
                return object;
            let message = new $root.streaming.QuoteOptions();
            if (object.swapMode != null)
                message.swapMode = object.swapMode >>> 0;
            if (object.dexes) {
                if (!Array.isArray(object.dexes))
                    throw TypeError(".streaming.QuoteOptions.dexes: array expected");
                message.dexes = [];
                for (let i = 0; i < object.dexes.length; ++i)
                    message.dexes[i] = String(object.dexes[i]);
            }
            if (object.excludeDexes) {
                if (!Array.isArray(object.excludeDexes))
                    throw TypeError(".streaming.QuoteOptions.excludeDexes: array expected");
                message.excludeDexes = [];
                for (let i = 0; i < object.excludeDexes.length; ++i)
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
            let object = {};
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
                object.dexes = [];
                for (let j = 0; j < message.dexes.length; ++j)
                    object.dexes[j] = message.dexes[j];
            }
            if (message.excludeDexes && message.excludeDexes.length) {
                object.excludeDexes = [];
                for (let j = 0; j < message.excludeDexes.length; ++j)
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
         * Gets the default type url for QuoteOptions
         * @function getTypeUrl
         * @memberof streaming.QuoteOptions
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        QuoteOptions.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/streaming.QuoteOptions";
        };

        return QuoteOptions;
    })();

    streaming.Empty = (function() {

        /**
         * Properties of an Empty.
         * @memberof streaming
         * @interface IEmpty
         */

        /**
         * Constructs a new Empty.
         * @memberof streaming
         * @classdesc Represents an Empty.
         * @implements IEmpty
         * @constructor
         * @param {streaming.IEmpty=} [properties] Properties to set
         */
        function Empty(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Creates a new Empty instance using the specified properties.
         * @function create
         * @memberof streaming.Empty
         * @static
         * @param {streaming.IEmpty=} [properties] Properties to set
         * @returns {streaming.Empty} Empty instance
         */
        Empty.create = function create(properties) {
            return new Empty(properties);
        };

        /**
         * Encodes the specified Empty message. Does not implicitly {@link streaming.Empty.verify|verify} messages.
         * @function encode
         * @memberof streaming.Empty
         * @static
         * @param {streaming.IEmpty} message Empty message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Empty.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        /**
         * Encodes the specified Empty message, length delimited. Does not implicitly {@link streaming.Empty.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.Empty
         * @static
         * @param {streaming.IEmpty} message Empty message or plain object to encode
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
         * @returns {streaming.Empty} Empty
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Empty.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.streaming.Empty();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Empty message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.Empty
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.Empty} Empty
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
        Empty.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
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
        Empty.fromObject = function fromObject(object) {
            if (object instanceof $root.streaming.Empty)
                return object;
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
         * Gets the default type url for Empty
         * @function getTypeUrl
         * @memberof streaming.Empty
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Empty.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/streaming.Empty";
        };

        return Empty;
    })();

    streaming.CoinsData = (function() {

        /**
         * Properties of a CoinsData.
         * @memberof streaming
         * @interface ICoinsData
         * @property {string|null} [price] CoinsData price
         * @property {string|null} [changePercent] CoinsData changePercent
         * @property {string|null} [imageUrl] CoinsData imageUrl
         * @property {number|null} [rank] CoinsData rank
         * @property {string|null} [coinName] CoinsData coinName
         */

        /**
         * Constructs a new CoinsData.
         * @memberof streaming
         * @classdesc Represents a CoinsData.
         * @implements ICoinsData
         * @constructor
         * @param {streaming.ICoinsData=} [properties] Properties to set
         */
        function CoinsData(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
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
        let $oneOfFields;

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
         * @param {streaming.ICoinsData=} [properties] Properties to set
         * @returns {streaming.CoinsData} CoinsData instance
         */
        CoinsData.create = function create(properties) {
            return new CoinsData(properties);
        };

        /**
         * Encodes the specified CoinsData message. Does not implicitly {@link streaming.CoinsData.verify|verify} messages.
         * @function encode
         * @memberof streaming.CoinsData
         * @static
         * @param {streaming.ICoinsData} message CoinsData message or plain object to encode
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
            return writer;
        };

        /**
         * Encodes the specified CoinsData message, length delimited. Does not implicitly {@link streaming.CoinsData.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.CoinsData
         * @static
         * @param {streaming.ICoinsData} message CoinsData message or plain object to encode
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
         * @returns {streaming.CoinsData} CoinsData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CoinsData.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.streaming.CoinsData();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.price = reader.string();
                        break;
                    }
                case 2: {
                        message.changePercent = reader.string();
                        break;
                    }
                case 3: {
                        message.imageUrl = reader.string();
                        break;
                    }
                case 4: {
                        message.rank = reader.uint32();
                        break;
                    }
                case 5: {
                        message.coinName = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CoinsData message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.CoinsData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.CoinsData} CoinsData
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
        CoinsData.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
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
        CoinsData.fromObject = function fromObject(object) {
            if (object instanceof $root.streaming.CoinsData)
                return object;
            let message = new $root.streaming.CoinsData();
            if (object.price != null)
                message.price = String(object.price);
            if (object.changePercent != null)
                message.changePercent = String(object.changePercent);
            if (object.imageUrl != null)
                message.imageUrl = String(object.imageUrl);
            if (object.rank != null)
                message.rank = object.rank >>> 0;
            if (object.coinName != null)
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
            let object = {};
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
         * Gets the default type url for CoinsData
         * @function getTypeUrl
         * @memberof streaming.CoinsData
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CoinsData.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/streaming.CoinsData";
        };

        return CoinsData;
    })();

    streaming.AddBundlesRequest = (function() {

        /**
         * Properties of an AddBundlesRequest.
         * @memberof streaming
         * @interface IAddBundlesRequest
         * @property {Array.<string>|null} [bundleIds] AddBundlesRequest bundleIds
         * @property {string|null} [userId] AddBundlesRequest userId
         */

        /**
         * Constructs a new AddBundlesRequest.
         * @memberof streaming
         * @classdesc Represents an AddBundlesRequest.
         * @implements IAddBundlesRequest
         * @constructor
         * @param {streaming.IAddBundlesRequest=} [properties] Properties to set
         */
        function AddBundlesRequest(properties) {
            this.bundleIds = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
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
         * @param {streaming.IAddBundlesRequest=} [properties] Properties to set
         * @returns {streaming.AddBundlesRequest} AddBundlesRequest instance
         */
        AddBundlesRequest.create = function create(properties) {
            return new AddBundlesRequest(properties);
        };

        /**
         * Encodes the specified AddBundlesRequest message. Does not implicitly {@link streaming.AddBundlesRequest.verify|verify} messages.
         * @function encode
         * @memberof streaming.AddBundlesRequest
         * @static
         * @param {streaming.IAddBundlesRequest} message AddBundlesRequest message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AddBundlesRequest.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.bundleIds != null && message.bundleIds.length)
                for (let i = 0; i < message.bundleIds.length; ++i)
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.bundleIds[i]);
            if (message.userId != null && Object.hasOwnProperty.call(message, "userId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.userId);
            return writer;
        };

        /**
         * Encodes the specified AddBundlesRequest message, length delimited. Does not implicitly {@link streaming.AddBundlesRequest.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.AddBundlesRequest
         * @static
         * @param {streaming.IAddBundlesRequest} message AddBundlesRequest message or plain object to encode
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
         * @returns {streaming.AddBundlesRequest} AddBundlesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AddBundlesRequest.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.streaming.AddBundlesRequest();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.bundleIds && message.bundleIds.length))
                            message.bundleIds = [];
                        message.bundleIds.push(reader.string());
                        break;
                    }
                case 2: {
                        message.userId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an AddBundlesRequest message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.AddBundlesRequest
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.AddBundlesRequest} AddBundlesRequest
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
        AddBundlesRequest.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.bundleIds != null && message.hasOwnProperty("bundleIds")) {
                if (!Array.isArray(message.bundleIds))
                    return "bundleIds: array expected";
                for (let i = 0; i < message.bundleIds.length; ++i)
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
        AddBundlesRequest.fromObject = function fromObject(object) {
            if (object instanceof $root.streaming.AddBundlesRequest)
                return object;
            let message = new $root.streaming.AddBundlesRequest();
            if (object.bundleIds) {
                if (!Array.isArray(object.bundleIds))
                    throw TypeError(".streaming.AddBundlesRequest.bundleIds: array expected");
                message.bundleIds = [];
                for (let i = 0; i < object.bundleIds.length; ++i)
                    message.bundleIds[i] = String(object.bundleIds[i]);
            }
            if (object.userId != null)
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
            let object = {};
            if (options.arrays || options.defaults)
                object.bundleIds = [];
            if (options.defaults)
                object.userId = "";
            if (message.bundleIds && message.bundleIds.length) {
                object.bundleIds = [];
                for (let j = 0; j < message.bundleIds.length; ++j)
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
         * Gets the default type url for AddBundlesRequest
         * @function getTypeUrl
         * @memberof streaming.AddBundlesRequest
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        AddBundlesRequest.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/streaming.AddBundlesRequest";
        };

        return AddBundlesRequest;
    })();

    streaming.UserBundleUpdate = (function() {

        /**
         * Properties of a UserBundleUpdate.
         * @memberof streaming
         * @interface IUserBundleUpdate
         * @property {string|null} [bundleId] UserBundleUpdate bundleId
         * @property {string|null} [oldStatus] UserBundleUpdate oldStatus
         * @property {streaming.BundleStage|null} [newStatus] UserBundleUpdate newStatus
         * @property {number|Long|null} [timestamp] UserBundleUpdate timestamp
         * @property {number|Long|null} [slot] UserBundleUpdate slot
         */

        /**
         * Constructs a new UserBundleUpdate.
         * @memberof streaming
         * @classdesc Represents a UserBundleUpdate.
         * @implements IUserBundleUpdate
         * @constructor
         * @param {streaming.IUserBundleUpdate=} [properties] Properties to set
         */
        function UserBundleUpdate(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
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
        let $oneOfFields;

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
         * @param {streaming.IUserBundleUpdate=} [properties] Properties to set
         * @returns {streaming.UserBundleUpdate} UserBundleUpdate instance
         */
        UserBundleUpdate.create = function create(properties) {
            return new UserBundleUpdate(properties);
        };

        /**
         * Encodes the specified UserBundleUpdate message. Does not implicitly {@link streaming.UserBundleUpdate.verify|verify} messages.
         * @function encode
         * @memberof streaming.UserBundleUpdate
         * @static
         * @param {streaming.IUserBundleUpdate} message UserBundleUpdate message or plain object to encode
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
            return writer;
        };

        /**
         * Encodes the specified UserBundleUpdate message, length delimited. Does not implicitly {@link streaming.UserBundleUpdate.verify|verify} messages.
         * @function encodeDelimited
         * @memberof streaming.UserBundleUpdate
         * @static
         * @param {streaming.IUserBundleUpdate} message UserBundleUpdate message or plain object to encode
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
         * @returns {streaming.UserBundleUpdate} UserBundleUpdate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UserBundleUpdate.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.streaming.UserBundleUpdate();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.bundleId = reader.string();
                        break;
                    }
                case 2: {
                        message.oldStatus = reader.string();
                        break;
                    }
                case 3: {
                        message.newStatus = reader.int32();
                        break;
                    }
                case 4: {
                        message.timestamp = reader.uint64();
                        break;
                    }
                case 5: {
                        message.slot = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a UserBundleUpdate message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof streaming.UserBundleUpdate
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {streaming.UserBundleUpdate} UserBundleUpdate
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
        UserBundleUpdate.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            let properties = {};
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
        UserBundleUpdate.fromObject = function fromObject(object) {
            if (object instanceof $root.streaming.UserBundleUpdate)
                return object;
            let message = new $root.streaming.UserBundleUpdate();
            if (object.bundleId != null)
                message.bundleId = String(object.bundleId);
            if (object.oldStatus != null)
                message.oldStatus = String(object.oldStatus);
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
            let object = {};
            if (options.defaults) {
                object.bundleId = "";
                object.oldStatus = "";
                object.newStatus = options.enums === String ? "BUNDLE_STAGE_UNSPECIFIED" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
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
         * Gets the default type url for UserBundleUpdate
         * @function getTypeUrl
         * @memberof streaming.UserBundleUpdate
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        UserBundleUpdate.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/streaming.UserBundleUpdate";
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
        const valuesById = {}, values = Object.create(valuesById);
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

export { $root as default };
