import * as $protobuf from "protobufjs";
import Long = require("long");

/** Namespace streaming. */
export namespace streaming {

    /** Represents a BundleService */
    class BundleService extends $protobuf.rpc.Service {

        /**
         * Constructs a new BundleService service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

        /**
         * Creates new BundleService service using the specified rpc implementation.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         * @returns RPC service. Useful where requests and/or responses are streamed.
         */
        static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): BundleService;

        /**
         * Calls SimulateBundle.
         * @param request SimulateBundleRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and BundleDelta
         */
        simulateBundle(request: streaming.ISimulateBundleRequest, callback: streaming.BundleService.SimulateBundleCallback): void;

        /**
         * Calls SimulateBundle.
         * @param request SimulateBundleRequest message or plain object
         * @returns Promise
         */
        simulateBundle(request: streaming.ISimulateBundleRequest): Promise<streaming.BundleDelta>;

        /**
         * Calls CreateTransactions.
         * @param request TransactionsBuld message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionsToSign
         */
        createTransactions(request: streaming.ITransactionsBuld, callback: streaming.BundleService.CreateTransactionsCallback): void;

        /**
         * Calls CreateTransactions.
         * @param request TransactionsBuld message or plain object
         * @returns Promise
         */
        createTransactions(request: streaming.ITransactionsBuld): Promise<streaming.TransactionsToSign>;

        /**
         * Calls SendTransactions.
         * @param request SignedTransactions message or plain object
         * @param callback Node-style callback called with the error, if any, and UserBundleUpdate
         */
        sendTransactions(request: streaming.ISignedTransactions, callback: streaming.BundleService.SendTransactionsCallback): void;

        /**
         * Calls SendTransactions.
         * @param request SignedTransactions message or plain object
         * @returns Promise
         */
        sendTransactions(request: streaming.ISignedTransactions): Promise<streaming.UserBundleUpdate>;

        /**
         * Calls SubscribeToBundles.
         * @param request UserBundleRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and UserBundleUpdate
         */
        subscribeToBundles(request: streaming.IUserBundleRequest, callback: streaming.BundleService.SubscribeToBundlesCallback): void;

        /**
         * Calls SubscribeToBundles.
         * @param request UserBundleRequest message or plain object
         * @returns Promise
         */
        subscribeToBundles(request: streaming.IUserBundleRequest): Promise<streaming.UserBundleUpdate>;
    }

    namespace BundleService {

        /**
         * Callback as used by {@link streaming.BundleService#simulateBundle}.
         * @param error Error, if any
         * @param [response] BundleDelta
         */
        type SimulateBundleCallback = (error: (Error|null), response?: streaming.BundleDelta) => void;

        /**
         * Callback as used by {@link streaming.BundleService#createTransactions}.
         * @param error Error, if any
         * @param [response] TransactionsToSign
         */
        type CreateTransactionsCallback = (error: (Error|null), response?: streaming.TransactionsToSign) => void;

        /**
         * Callback as used by {@link streaming.BundleService#sendTransactions}.
         * @param error Error, if any
         * @param [response] UserBundleUpdate
         */
        type SendTransactionsCallback = (error: (Error|null), response?: streaming.UserBundleUpdate) => void;

        /**
         * Callback as used by {@link streaming.BundleService#subscribeToBundles}.
         * @param error Error, if any
         * @param [response] UserBundleUpdate
         */
        type SubscribeToBundlesCallback = (error: (Error|null), response?: streaming.UserBundleUpdate) => void;
    }

    /**
     * Properties of a SimulateBundleRequest.
     * @deprecated Use streaming.SimulateBundleRequest.$Properties instead.
     */
    interface ISimulateBundleRequest extends streaming.SimulateBundleRequest.$Properties {
    }

    /** Represents a SimulateBundleRequest. */
    class SimulateBundleRequest {

        /**
         * Constructs a new SimulateBundleRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.SimulateBundleRequest.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** SimulateBundleRequest swaps. */
        swaps: streaming.SwapSimulationRequest.$Properties[];

        /**
         * Creates a new SimulateBundleRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SimulateBundleRequest instance
         */
        static create(properties: streaming.SimulateBundleRequest.$Shape): streaming.SimulateBundleRequest & streaming.SimulateBundleRequest.$Shape;
        static create(properties?: streaming.SimulateBundleRequest.$Properties): streaming.SimulateBundleRequest;

        /**
         * Encodes the specified SimulateBundleRequest message. Does not implicitly {@link streaming.SimulateBundleRequest.verify|verify} messages.
         * @param message SimulateBundleRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: streaming.SimulateBundleRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified SimulateBundleRequest message, length delimited. Does not implicitly {@link streaming.SimulateBundleRequest.verify|verify} messages.
         * @param message SimulateBundleRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: streaming.SimulateBundleRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SimulateBundleRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {streaming.SimulateBundleRequest & streaming.SimulateBundleRequest.$Shape} SimulateBundleRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.SimulateBundleRequest & streaming.SimulateBundleRequest.$Shape;

        /**
         * Decodes a SimulateBundleRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {streaming.SimulateBundleRequest & streaming.SimulateBundleRequest.$Shape} SimulateBundleRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.SimulateBundleRequest & streaming.SimulateBundleRequest.$Shape;

        /**
         * Verifies a SimulateBundleRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a SimulateBundleRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns SimulateBundleRequest
         */
        static fromObject(object: { [k: string]: any }): streaming.SimulateBundleRequest;

        /**
         * Creates a plain object from a SimulateBundleRequest message. Also converts values to other types if specified.
         * @param message SimulateBundleRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: streaming.SimulateBundleRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this SimulateBundleRequest to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for SimulateBundleRequest
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace SimulateBundleRequest {

        /** Properties of a SimulateBundleRequest. */
        interface $Properties {

            /** SimulateBundleRequest swaps */
            swaps?: (streaming.SwapSimulationRequest.$Properties[]|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a SimulateBundleRequest. */
        type $Shape = streaming.SimulateBundleRequest.$Properties;
    }

    /**
     * Properties of a SwapSimulationRequest.
     * @deprecated Use streaming.SwapSimulationRequest.$Properties instead.
     */
    interface ISwapSimulationRequest extends streaming.SwapSimulationRequest.$Properties {
    }

    /** Represents a SwapSimulationRequest. */
    class SwapSimulationRequest {

        /**
         * Constructs a new SwapSimulationRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.SwapSimulationRequest.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** SwapSimulationRequest id. */
        id: string;

        /** SwapSimulationRequest inputMint. */
        inputMint: string;

        /** SwapSimulationRequest inputAmount. */
        inputAmount: (number|Long);

        /** SwapSimulationRequest outputMint. */
        outputMint: string;

        /** SwapSimulationRequest expectedOutput. */
        expectedOutput: (number|Long);

        /** SwapSimulationRequest slippageBps. */
        slippageBps: number;

        /**
         * Creates a new SwapSimulationRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SwapSimulationRequest instance
         */
        static create(properties: streaming.SwapSimulationRequest.$Shape): streaming.SwapSimulationRequest & streaming.SwapSimulationRequest.$Shape;
        static create(properties?: streaming.SwapSimulationRequest.$Properties): streaming.SwapSimulationRequest;

        /**
         * Encodes the specified SwapSimulationRequest message. Does not implicitly {@link streaming.SwapSimulationRequest.verify|verify} messages.
         * @param message SwapSimulationRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: streaming.SwapSimulationRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified SwapSimulationRequest message, length delimited. Does not implicitly {@link streaming.SwapSimulationRequest.verify|verify} messages.
         * @param message SwapSimulationRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: streaming.SwapSimulationRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SwapSimulationRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {streaming.SwapSimulationRequest & streaming.SwapSimulationRequest.$Shape} SwapSimulationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.SwapSimulationRequest & streaming.SwapSimulationRequest.$Shape;

        /**
         * Decodes a SwapSimulationRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {streaming.SwapSimulationRequest & streaming.SwapSimulationRequest.$Shape} SwapSimulationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.SwapSimulationRequest & streaming.SwapSimulationRequest.$Shape;

        /**
         * Verifies a SwapSimulationRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a SwapSimulationRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns SwapSimulationRequest
         */
        static fromObject(object: { [k: string]: any }): streaming.SwapSimulationRequest;

        /**
         * Creates a plain object from a SwapSimulationRequest message. Also converts values to other types if specified.
         * @param message SwapSimulationRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: streaming.SwapSimulationRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this SwapSimulationRequest to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for SwapSimulationRequest
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace SwapSimulationRequest {

        /** Properties of a SwapSimulationRequest. */
        interface $Properties {

            /** SwapSimulationRequest id */
            id?: (string|null);

            /** SwapSimulationRequest inputMint */
            inputMint?: (string|null);

            /** SwapSimulationRequest inputAmount */
            inputAmount?: (number|Long|null);

            /** SwapSimulationRequest outputMint */
            outputMint?: (string|null);

            /** SwapSimulationRequest expectedOutput */
            expectedOutput?: (number|Long|null);

            /** SwapSimulationRequest slippageBps */
            slippageBps?: (number|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a SwapSimulationRequest. */
        type $Shape = streaming.SwapSimulationRequest.$Properties;
    }

    /**
     * Properties of a UserBundleRequest.
     * @deprecated Use streaming.UserBundleRequest.$Properties instead.
     */
    interface IUserBundleRequest extends streaming.UserBundleRequest.$Properties {
    }

    /** Represents a UserBundleRequest. */
    class UserBundleRequest {

        /**
         * Constructs a new UserBundleRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.UserBundleRequest.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** UserBundleRequest userPk. */
        userPk: string;

        /** UserBundleRequest bundleId. */
        bundleId?: (string|null);

        /**
         * Creates a new UserBundleRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UserBundleRequest instance
         */
        static create(properties: streaming.UserBundleRequest.$Shape): streaming.UserBundleRequest & streaming.UserBundleRequest.$Shape;
        static create(properties?: streaming.UserBundleRequest.$Properties): streaming.UserBundleRequest;

        /**
         * Encodes the specified UserBundleRequest message. Does not implicitly {@link streaming.UserBundleRequest.verify|verify} messages.
         * @param message UserBundleRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: streaming.UserBundleRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UserBundleRequest message, length delimited. Does not implicitly {@link streaming.UserBundleRequest.verify|verify} messages.
         * @param message UserBundleRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: streaming.UserBundleRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a UserBundleRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {streaming.UserBundleRequest & streaming.UserBundleRequest.$Shape} UserBundleRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.UserBundleRequest & streaming.UserBundleRequest.$Shape;

        /**
         * Decodes a UserBundleRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {streaming.UserBundleRequest & streaming.UserBundleRequest.$Shape} UserBundleRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.UserBundleRequest & streaming.UserBundleRequest.$Shape;

        /**
         * Verifies a UserBundleRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a UserBundleRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UserBundleRequest
         */
        static fromObject(object: { [k: string]: any }): streaming.UserBundleRequest;

        /**
         * Creates a plain object from a UserBundleRequest message. Also converts values to other types if specified.
         * @param message UserBundleRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: streaming.UserBundleRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UserBundleRequest to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for UserBundleRequest
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace UserBundleRequest {

        /** Properties of a UserBundleRequest. */
        interface $Properties {

            /** UserBundleRequest userPk */
            userPk?: (string|null);

            /** UserBundleRequest bundleId */
            bundleId?: (string|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a UserBundleRequest. */
        type $Shape = streaming.UserBundleRequest.$Properties;
    }

    /**
     * Properties of a SignedTransactions.
     * @deprecated Use streaming.SignedTransactions.$Properties instead.
     */
    interface ISignedTransactions extends streaming.SignedTransactions.$Properties {
    }

    /** Represents a SignedTransactions. */
    class SignedTransactions {

        /**
         * Constructs a new SignedTransactions.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.SignedTransactions.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** SignedTransactions transactions. */
        transactions: string[];

        /** SignedTransactions userPk. */
        userPk: string;

        /**
         * Creates a new SignedTransactions instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SignedTransactions instance
         */
        static create(properties: streaming.SignedTransactions.$Shape): streaming.SignedTransactions & streaming.SignedTransactions.$Shape;
        static create(properties?: streaming.SignedTransactions.$Properties): streaming.SignedTransactions;

        /**
         * Encodes the specified SignedTransactions message. Does not implicitly {@link streaming.SignedTransactions.verify|verify} messages.
         * @param message SignedTransactions message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: streaming.SignedTransactions.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified SignedTransactions message, length delimited. Does not implicitly {@link streaming.SignedTransactions.verify|verify} messages.
         * @param message SignedTransactions message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: streaming.SignedTransactions.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SignedTransactions message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {streaming.SignedTransactions & streaming.SignedTransactions.$Shape} SignedTransactions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.SignedTransactions & streaming.SignedTransactions.$Shape;

        /**
         * Decodes a SignedTransactions message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {streaming.SignedTransactions & streaming.SignedTransactions.$Shape} SignedTransactions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.SignedTransactions & streaming.SignedTransactions.$Shape;

        /**
         * Verifies a SignedTransactions message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a SignedTransactions message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns SignedTransactions
         */
        static fromObject(object: { [k: string]: any }): streaming.SignedTransactions;

        /**
         * Creates a plain object from a SignedTransactions message. Also converts values to other types if specified.
         * @param message SignedTransactions
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: streaming.SignedTransactions, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this SignedTransactions to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for SignedTransactions
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace SignedTransactions {

        /** Properties of a SignedTransactions. */
        interface $Properties {

            /** SignedTransactions transactions */
            transactions?: (string[]|null);

            /** SignedTransactions userPk */
            userPk?: (string|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a SignedTransactions. */
        type $Shape = streaming.SignedTransactions.$Properties;
    }

    /**
     * Properties of a BuiltTransaction.
     * @deprecated Use streaming.BuiltTransaction.$Properties instead.
     */
    interface IBuiltTransaction extends streaming.BuiltTransaction.$Properties {
    }

    /** Represents a BuiltTransaction. */
    class BuiltTransaction {

        /**
         * Constructs a new BuiltTransaction.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.BuiltTransaction.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** BuiltTransaction id. */
        id: string;

        /** BuiltTransaction transactionBase58. */
        transactionBase58: string;

        /**
         * Creates a new BuiltTransaction instance using the specified properties.
         * @param [properties] Properties to set
         * @returns BuiltTransaction instance
         */
        static create(properties: streaming.BuiltTransaction.$Shape): streaming.BuiltTransaction & streaming.BuiltTransaction.$Shape;
        static create(properties?: streaming.BuiltTransaction.$Properties): streaming.BuiltTransaction;

        /**
         * Encodes the specified BuiltTransaction message. Does not implicitly {@link streaming.BuiltTransaction.verify|verify} messages.
         * @param message BuiltTransaction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: streaming.BuiltTransaction.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified BuiltTransaction message, length delimited. Does not implicitly {@link streaming.BuiltTransaction.verify|verify} messages.
         * @param message BuiltTransaction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: streaming.BuiltTransaction.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a BuiltTransaction message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {streaming.BuiltTransaction & streaming.BuiltTransaction.$Shape} BuiltTransaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.BuiltTransaction & streaming.BuiltTransaction.$Shape;

        /**
         * Decodes a BuiltTransaction message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {streaming.BuiltTransaction & streaming.BuiltTransaction.$Shape} BuiltTransaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.BuiltTransaction & streaming.BuiltTransaction.$Shape;

        /**
         * Verifies a BuiltTransaction message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a BuiltTransaction message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns BuiltTransaction
         */
        static fromObject(object: { [k: string]: any }): streaming.BuiltTransaction;

        /**
         * Creates a plain object from a BuiltTransaction message. Also converts values to other types if specified.
         * @param message BuiltTransaction
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: streaming.BuiltTransaction, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this BuiltTransaction to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for BuiltTransaction
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace BuiltTransaction {

        /** Properties of a BuiltTransaction. */
        interface $Properties {

            /** BuiltTransaction id */
            id?: (string|null);

            /** BuiltTransaction transactionBase58 */
            transactionBase58?: (string|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a BuiltTransaction. */
        type $Shape = streaming.BuiltTransaction.$Properties;
    }

    /**
     * Properties of a TransactionsToSign.
     * @deprecated Use streaming.TransactionsToSign.$Properties instead.
     */
    interface ITransactionsToSign extends streaming.TransactionsToSign.$Properties {
    }

    /** Represents a TransactionsToSign. */
    class TransactionsToSign {

        /**
         * Constructs a new TransactionsToSign.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.TransactionsToSign.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** TransactionsToSign transactions. */
        transactions: streaming.BuiltTransaction.$Properties[];

        /**
         * Creates a new TransactionsToSign instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransactionsToSign instance
         */
        static create(properties: streaming.TransactionsToSign.$Shape): streaming.TransactionsToSign & streaming.TransactionsToSign.$Shape;
        static create(properties?: streaming.TransactionsToSign.$Properties): streaming.TransactionsToSign;

        /**
         * Encodes the specified TransactionsToSign message. Does not implicitly {@link streaming.TransactionsToSign.verify|verify} messages.
         * @param message TransactionsToSign message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: streaming.TransactionsToSign.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TransactionsToSign message, length delimited. Does not implicitly {@link streaming.TransactionsToSign.verify|verify} messages.
         * @param message TransactionsToSign message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: streaming.TransactionsToSign.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransactionsToSign message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {streaming.TransactionsToSign & streaming.TransactionsToSign.$Shape} TransactionsToSign
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.TransactionsToSign & streaming.TransactionsToSign.$Shape;

        /**
         * Decodes a TransactionsToSign message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {streaming.TransactionsToSign & streaming.TransactionsToSign.$Shape} TransactionsToSign
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.TransactionsToSign & streaming.TransactionsToSign.$Shape;

        /**
         * Verifies a TransactionsToSign message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TransactionsToSign message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TransactionsToSign
         */
        static fromObject(object: { [k: string]: any }): streaming.TransactionsToSign;

        /**
         * Creates a plain object from a TransactionsToSign message. Also converts values to other types if specified.
         * @param message TransactionsToSign
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: streaming.TransactionsToSign, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TransactionsToSign to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for TransactionsToSign
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace TransactionsToSign {

        /** Properties of a TransactionsToSign. */
        interface $Properties {

            /** TransactionsToSign transactions */
            transactions?: (streaming.BuiltTransaction.$Properties[]|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a TransactionsToSign. */
        type $Shape = streaming.TransactionsToSign.$Properties;
    }

    /**
     * Properties of a BundleDelta.
     * @deprecated Use streaming.BundleDelta.$Properties instead.
     */
    interface IBundleDelta extends streaming.BundleDelta.$Properties {
    }

    /** Represents a BundleDelta. */
    class BundleDelta {

        /**
         * Constructs a new BundleDelta.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.BundleDelta.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** BundleDelta swaps. */
        swaps: streaming.TransactionDelta.$Properties[];

        /** BundleDelta jitoTipLamports. */
        jitoTipLamports: (number|Long);

        /** BundleDelta totalNetworkFeeLamports. */
        totalNetworkFeeLamports: (number|Long);

        /**
         * Creates a new BundleDelta instance using the specified properties.
         * @param [properties] Properties to set
         * @returns BundleDelta instance
         */
        static create(properties: streaming.BundleDelta.$Shape): streaming.BundleDelta & streaming.BundleDelta.$Shape;
        static create(properties?: streaming.BundleDelta.$Properties): streaming.BundleDelta;

        /**
         * Encodes the specified BundleDelta message. Does not implicitly {@link streaming.BundleDelta.verify|verify} messages.
         * @param message BundleDelta message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: streaming.BundleDelta.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified BundleDelta message, length delimited. Does not implicitly {@link streaming.BundleDelta.verify|verify} messages.
         * @param message BundleDelta message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: streaming.BundleDelta.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a BundleDelta message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {streaming.BundleDelta & streaming.BundleDelta.$Shape} BundleDelta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.BundleDelta & streaming.BundleDelta.$Shape;

        /**
         * Decodes a BundleDelta message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {streaming.BundleDelta & streaming.BundleDelta.$Shape} BundleDelta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.BundleDelta & streaming.BundleDelta.$Shape;

        /**
         * Verifies a BundleDelta message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a BundleDelta message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns BundleDelta
         */
        static fromObject(object: { [k: string]: any }): streaming.BundleDelta;

        /**
         * Creates a plain object from a BundleDelta message. Also converts values to other types if specified.
         * @param message BundleDelta
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: streaming.BundleDelta, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this BundleDelta to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for BundleDelta
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace BundleDelta {

        /** Properties of a BundleDelta. */
        interface $Properties {

            /** BundleDelta swaps */
            swaps?: (streaming.TransactionDelta.$Properties[]|null);

            /** BundleDelta jitoTipLamports */
            jitoTipLamports?: (number|Long|null);

            /** BundleDelta totalNetworkFeeLamports */
            totalNetworkFeeLamports?: (number|Long|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a BundleDelta. */
        type $Shape = streaming.BundleDelta.$Properties;
    }

    /**
     * Properties of a TransactionDelta.
     * @deprecated Use streaming.TransactionDelta.$Properties instead.
     */
    interface ITransactionDelta extends streaming.TransactionDelta.$Properties {
    }

    /** Represents a TransactionDelta. */
    class TransactionDelta {

        /**
         * Constructs a new TransactionDelta.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.TransactionDelta.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** TransactionDelta inputMint. */
        inputMint: string;

        /** TransactionDelta inputAmount. */
        inputAmount: (number|Long);

        /** TransactionDelta outputMint. */
        outputMint: string;

        /** TransactionDelta expectedOutput. */
        expectedOutput: (number|Long);

        /** TransactionDelta minimumOutput. */
        minimumOutput: (number|Long);

        /** TransactionDelta jitoTipLamports. */
        jitoTipLamports: (number|Long);

        /** TransactionDelta networkFeeLamports. */
        networkFeeLamports: (number|Long);

        /** TransactionDelta platformFeeBps. */
        platformFeeBps: number;

        /** TransactionDelta id. */
        id: string;

        /**
         * Creates a new TransactionDelta instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransactionDelta instance
         */
        static create(properties: streaming.TransactionDelta.$Shape): streaming.TransactionDelta & streaming.TransactionDelta.$Shape;
        static create(properties?: streaming.TransactionDelta.$Properties): streaming.TransactionDelta;

        /**
         * Encodes the specified TransactionDelta message. Does not implicitly {@link streaming.TransactionDelta.verify|verify} messages.
         * @param message TransactionDelta message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: streaming.TransactionDelta.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TransactionDelta message, length delimited. Does not implicitly {@link streaming.TransactionDelta.verify|verify} messages.
         * @param message TransactionDelta message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: streaming.TransactionDelta.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransactionDelta message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {streaming.TransactionDelta & streaming.TransactionDelta.$Shape} TransactionDelta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.TransactionDelta & streaming.TransactionDelta.$Shape;

        /**
         * Decodes a TransactionDelta message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {streaming.TransactionDelta & streaming.TransactionDelta.$Shape} TransactionDelta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.TransactionDelta & streaming.TransactionDelta.$Shape;

        /**
         * Verifies a TransactionDelta message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TransactionDelta message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TransactionDelta
         */
        static fromObject(object: { [k: string]: any }): streaming.TransactionDelta;

        /**
         * Creates a plain object from a TransactionDelta message. Also converts values to other types if specified.
         * @param message TransactionDelta
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: streaming.TransactionDelta, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TransactionDelta to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for TransactionDelta
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace TransactionDelta {

        /** Properties of a TransactionDelta. */
        interface $Properties {

            /** TransactionDelta inputMint */
            inputMint?: (string|null);

            /** TransactionDelta inputAmount */
            inputAmount?: (number|Long|null);

            /** TransactionDelta outputMint */
            outputMint?: (string|null);

            /** TransactionDelta expectedOutput */
            expectedOutput?: (number|Long|null);

            /** TransactionDelta minimumOutput */
            minimumOutput?: (number|Long|null);

            /** TransactionDelta jitoTipLamports */
            jitoTipLamports?: (number|Long|null);

            /** TransactionDelta networkFeeLamports */
            networkFeeLamports?: (number|Long|null);

            /** TransactionDelta platformFeeBps */
            platformFeeBps?: (number|null);

            /** TransactionDelta id */
            id?: (string|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a TransactionDelta. */
        type $Shape = streaming.TransactionDelta.$Properties;
    }

    /**
     * Properties of a TransactionsBuld.
     * @deprecated Use streaming.TransactionsBuld.$Properties instead.
     */
    interface ITransactionsBuld extends streaming.TransactionsBuld.$Properties {
    }

    /** Represents a TransactionsBuld. */
    class TransactionsBuld {

        /**
         * Constructs a new TransactionsBuld.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.TransactionsBuld.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** TransactionsBuld transactions. */
        transactions: streaming.TrasnactionInstruction.$Properties[];

        /**
         * Creates a new TransactionsBuld instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransactionsBuld instance
         */
        static create(properties: streaming.TransactionsBuld.$Shape): streaming.TransactionsBuld & streaming.TransactionsBuld.$Shape;
        static create(properties?: streaming.TransactionsBuld.$Properties): streaming.TransactionsBuld;

        /**
         * Encodes the specified TransactionsBuld message. Does not implicitly {@link streaming.TransactionsBuld.verify|verify} messages.
         * @param message TransactionsBuld message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: streaming.TransactionsBuld.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TransactionsBuld message, length delimited. Does not implicitly {@link streaming.TransactionsBuld.verify|verify} messages.
         * @param message TransactionsBuld message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: streaming.TransactionsBuld.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransactionsBuld message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {streaming.TransactionsBuld & streaming.TransactionsBuld.$Shape} TransactionsBuld
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.TransactionsBuld & streaming.TransactionsBuld.$Shape;

        /**
         * Decodes a TransactionsBuld message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {streaming.TransactionsBuld & streaming.TransactionsBuld.$Shape} TransactionsBuld
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.TransactionsBuld & streaming.TransactionsBuld.$Shape;

        /**
         * Verifies a TransactionsBuld message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TransactionsBuld message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TransactionsBuld
         */
        static fromObject(object: { [k: string]: any }): streaming.TransactionsBuld;

        /**
         * Creates a plain object from a TransactionsBuld message. Also converts values to other types if specified.
         * @param message TransactionsBuld
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: streaming.TransactionsBuld, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TransactionsBuld to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for TransactionsBuld
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace TransactionsBuld {

        /** Properties of a TransactionsBuld. */
        interface $Properties {

            /** TransactionsBuld transactions */
            transactions?: (streaming.TrasnactionInstruction.$Properties[]|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a TransactionsBuld. */
        type $Shape = streaming.TransactionsBuld.$Properties;
    }

    /**
     * Properties of a TrasnactionInstruction.
     * @deprecated Use streaming.TrasnactionInstruction.$Properties instead.
     */
    interface ITrasnactionInstruction extends streaming.TrasnactionInstruction.$Properties {
    }

    /** Represents a TrasnactionInstruction. */
    class TrasnactionInstruction {

        /**
         * Constructs a new TrasnactionInstruction.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.TrasnactionInstruction.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** TrasnactionInstruction inputMint. */
        inputMint: string;

        /** TrasnactionInstruction outputMint. */
        outputMint: string;

        /** TrasnactionInstruction amount. */
        amount: (number|Long);

        /** TrasnactionInstruction slippageBps. */
        slippageBps: number;

        /** TrasnactionInstruction options. */
        options?: (streaming.QuoteOptions.$Properties|null);

        /** TrasnactionInstruction userPk. */
        userPk: string;

        /** TrasnactionInstruction optionalDestination. */
        optionalDestination?: (string|null);

        /** TrasnactionInstruction id. */
        id: string;

        /**
         * Creates a new TrasnactionInstruction instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TrasnactionInstruction instance
         */
        static create(properties: streaming.TrasnactionInstruction.$Shape): streaming.TrasnactionInstruction & streaming.TrasnactionInstruction.$Shape;
        static create(properties?: streaming.TrasnactionInstruction.$Properties): streaming.TrasnactionInstruction;

        /**
         * Encodes the specified TrasnactionInstruction message. Does not implicitly {@link streaming.TrasnactionInstruction.verify|verify} messages.
         * @param message TrasnactionInstruction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: streaming.TrasnactionInstruction.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TrasnactionInstruction message, length delimited. Does not implicitly {@link streaming.TrasnactionInstruction.verify|verify} messages.
         * @param message TrasnactionInstruction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: streaming.TrasnactionInstruction.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TrasnactionInstruction message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {streaming.TrasnactionInstruction & streaming.TrasnactionInstruction.$Shape} TrasnactionInstruction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.TrasnactionInstruction & streaming.TrasnactionInstruction.$Shape;

        /**
         * Decodes a TrasnactionInstruction message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {streaming.TrasnactionInstruction & streaming.TrasnactionInstruction.$Shape} TrasnactionInstruction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.TrasnactionInstruction & streaming.TrasnactionInstruction.$Shape;

        /**
         * Verifies a TrasnactionInstruction message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TrasnactionInstruction message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TrasnactionInstruction
         */
        static fromObject(object: { [k: string]: any }): streaming.TrasnactionInstruction;

        /**
         * Creates a plain object from a TrasnactionInstruction message. Also converts values to other types if specified.
         * @param message TrasnactionInstruction
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: streaming.TrasnactionInstruction, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TrasnactionInstruction to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for TrasnactionInstruction
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace TrasnactionInstruction {

        /** Properties of a TrasnactionInstruction. */
        interface $Properties {

            /** TrasnactionInstruction inputMint */
            inputMint?: (string|null);

            /** TrasnactionInstruction outputMint */
            outputMint?: (string|null);

            /** TrasnactionInstruction amount */
            amount?: (number|Long|null);

            /** TrasnactionInstruction slippageBps */
            slippageBps?: (number|null);

            /** TrasnactionInstruction options */
            options?: (streaming.QuoteOptions.$Properties|null);

            /** TrasnactionInstruction userPk */
            userPk?: (string|null);

            /** TrasnactionInstruction optionalDestination */
            optionalDestination?: (string|null);

            /** TrasnactionInstruction id */
            id?: (string|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a TrasnactionInstruction. */
        type $Shape = streaming.TrasnactionInstruction.$Properties;
    }

    /**
     * Properties of a QuoteOptions.
     * @deprecated Use streaming.QuoteOptions.$Properties instead.
     */
    interface IQuoteOptions extends streaming.QuoteOptions.$Properties {
    }

    /** Represents a QuoteOptions. */
    class QuoteOptions {

        /**
         * Constructs a new QuoteOptions.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.QuoteOptions.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** QuoteOptions swapMode. */
        swapMode?: (number|null);

        /** QuoteOptions dexes. */
        dexes: string[];

        /** QuoteOptions excludeDexes. */
        excludeDexes: string[];

        /** QuoteOptions dynamicSlippage. */
        dynamicSlippage?: (boolean|null);

        /** QuoteOptions restrictIntermediateTokens. */
        restrictIntermediateTokens?: (boolean|null);

        /** QuoteOptions onlyDirectRoutes. */
        onlyDirectRoutes?: (boolean|null);

        /** QuoteOptions asLegacyTransaction. */
        asLegacyTransaction?: (boolean|null);

        /** QuoteOptions maxAccounts. */
        maxAccounts?: (number|null);

        /** QuoteOptions blockhashSlotsToExpiry. */
        blockhashSlotsToExpiry?: (number|null);

        /**
         * Creates a new QuoteOptions instance using the specified properties.
         * @param [properties] Properties to set
         * @returns QuoteOptions instance
         */
        static create(properties: streaming.QuoteOptions.$Shape): streaming.QuoteOptions & streaming.QuoteOptions.$Shape;
        static create(properties?: streaming.QuoteOptions.$Properties): streaming.QuoteOptions;

        /**
         * Encodes the specified QuoteOptions message. Does not implicitly {@link streaming.QuoteOptions.verify|verify} messages.
         * @param message QuoteOptions message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: streaming.QuoteOptions.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified QuoteOptions message, length delimited. Does not implicitly {@link streaming.QuoteOptions.verify|verify} messages.
         * @param message QuoteOptions message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: streaming.QuoteOptions.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a QuoteOptions message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {streaming.QuoteOptions & streaming.QuoteOptions.$Shape} QuoteOptions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.QuoteOptions & streaming.QuoteOptions.$Shape;

        /**
         * Decodes a QuoteOptions message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {streaming.QuoteOptions & streaming.QuoteOptions.$Shape} QuoteOptions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.QuoteOptions & streaming.QuoteOptions.$Shape;

        /**
         * Verifies a QuoteOptions message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a QuoteOptions message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns QuoteOptions
         */
        static fromObject(object: { [k: string]: any }): streaming.QuoteOptions;

        /**
         * Creates a plain object from a QuoteOptions message. Also converts values to other types if specified.
         * @param message QuoteOptions
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: streaming.QuoteOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this QuoteOptions to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for QuoteOptions
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace QuoteOptions {

        /** Properties of a QuoteOptions. */
        interface $Properties {

            /** QuoteOptions swapMode */
            swapMode?: (number|null);

            /** QuoteOptions dexes */
            dexes?: (string[]|null);

            /** QuoteOptions excludeDexes */
            excludeDexes?: (string[]|null);

            /** QuoteOptions dynamicSlippage */
            dynamicSlippage?: (boolean|null);

            /** QuoteOptions restrictIntermediateTokens */
            restrictIntermediateTokens?: (boolean|null);

            /** QuoteOptions onlyDirectRoutes */
            onlyDirectRoutes?: (boolean|null);

            /** QuoteOptions asLegacyTransaction */
            asLegacyTransaction?: (boolean|null);

            /** QuoteOptions maxAccounts */
            maxAccounts?: (number|null);

            /** QuoteOptions blockhashSlotsToExpiry */
            blockhashSlotsToExpiry?: (number|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a QuoteOptions. */
        type $Shape = streaming.QuoteOptions.$Properties;
    }

    /**
     * Properties of an Empty.
     * @deprecated Use streaming.Empty.$Properties instead.
     */
    interface IEmpty extends streaming.Empty.$Properties {
    }

    /** Represents an Empty. */
    class Empty {

        /**
         * Constructs a new Empty.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.Empty.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /**
         * Creates a new Empty instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Empty instance
         */
        static create(properties: streaming.Empty.$Shape): streaming.Empty & streaming.Empty.$Shape;
        static create(properties?: streaming.Empty.$Properties): streaming.Empty;

        /**
         * Encodes the specified Empty message. Does not implicitly {@link streaming.Empty.verify|verify} messages.
         * @param message Empty message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: streaming.Empty.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Empty message, length delimited. Does not implicitly {@link streaming.Empty.verify|verify} messages.
         * @param message Empty message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: streaming.Empty.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Empty message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {streaming.Empty & streaming.Empty.$Shape} Empty
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.Empty & streaming.Empty.$Shape;

        /**
         * Decodes an Empty message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {streaming.Empty & streaming.Empty.$Shape} Empty
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.Empty & streaming.Empty.$Shape;

        /**
         * Verifies an Empty message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Empty message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Empty
         */
        static fromObject(object: { [k: string]: any }): streaming.Empty;

        /**
         * Creates a plain object from an Empty message. Also converts values to other types if specified.
         * @param message Empty
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: streaming.Empty, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Empty to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for Empty
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Empty {

        /** Properties of an Empty. */
        interface $Properties {

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an Empty. */
        type $Shape = streaming.Empty.$Properties;
    }

    /**
     * Properties of a CoinsData.
     * @deprecated Use streaming.CoinsData.$Properties instead.
     */
    interface ICoinsData extends streaming.CoinsData.$Properties {
    }

    /** Represents a CoinsData. */
    class CoinsData {

        /**
         * Constructs a new CoinsData.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.CoinsData.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** CoinsData price. */
        price: string;

        /** CoinsData changePercent. */
        changePercent: string;

        /** CoinsData imageUrl. */
        imageUrl: string;

        /** CoinsData rank. */
        rank?: (number|null);

        /** CoinsData coinName. */
        coinName: string;

        /**
         * Creates a new CoinsData instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CoinsData instance
         */
        static create(properties: streaming.CoinsData.$Shape): streaming.CoinsData & streaming.CoinsData.$Shape;
        static create(properties?: streaming.CoinsData.$Properties): streaming.CoinsData;

        /**
         * Encodes the specified CoinsData message. Does not implicitly {@link streaming.CoinsData.verify|verify} messages.
         * @param message CoinsData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: streaming.CoinsData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CoinsData message, length delimited. Does not implicitly {@link streaming.CoinsData.verify|verify} messages.
         * @param message CoinsData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: streaming.CoinsData.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CoinsData message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {streaming.CoinsData & streaming.CoinsData.$Shape} CoinsData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.CoinsData & streaming.CoinsData.$Shape;

        /**
         * Decodes a CoinsData message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {streaming.CoinsData & streaming.CoinsData.$Shape} CoinsData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.CoinsData & streaming.CoinsData.$Shape;

        /**
         * Verifies a CoinsData message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CoinsData message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CoinsData
         */
        static fromObject(object: { [k: string]: any }): streaming.CoinsData;

        /**
         * Creates a plain object from a CoinsData message. Also converts values to other types if specified.
         * @param message CoinsData
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: streaming.CoinsData, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CoinsData to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for CoinsData
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace CoinsData {

        /** Properties of a CoinsData. */
        interface $Properties {

            /** CoinsData price */
            price?: (string|null);

            /** CoinsData changePercent */
            changePercent?: (string|null);

            /** CoinsData imageUrl */
            imageUrl?: (string|null);

            /** CoinsData rank */
            rank?: (number|null);

            /** CoinsData coinName */
            coinName?: (string|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a CoinsData. */
        type $Shape = streaming.CoinsData.$Properties;
    }

    /**
     * Properties of an AddBundlesRequest.
     * @deprecated Use streaming.AddBundlesRequest.$Properties instead.
     */
    interface IAddBundlesRequest extends streaming.AddBundlesRequest.$Properties {
    }

    /** Represents an AddBundlesRequest. */
    class AddBundlesRequest {

        /**
         * Constructs a new AddBundlesRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.AddBundlesRequest.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** AddBundlesRequest bundleIds. */
        bundleIds: string[];

        /** AddBundlesRequest userId. */
        userId: string;

        /**
         * Creates a new AddBundlesRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns AddBundlesRequest instance
         */
        static create(properties: streaming.AddBundlesRequest.$Shape): streaming.AddBundlesRequest & streaming.AddBundlesRequest.$Shape;
        static create(properties?: streaming.AddBundlesRequest.$Properties): streaming.AddBundlesRequest;

        /**
         * Encodes the specified AddBundlesRequest message. Does not implicitly {@link streaming.AddBundlesRequest.verify|verify} messages.
         * @param message AddBundlesRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: streaming.AddBundlesRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified AddBundlesRequest message, length delimited. Does not implicitly {@link streaming.AddBundlesRequest.verify|verify} messages.
         * @param message AddBundlesRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: streaming.AddBundlesRequest.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an AddBundlesRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {streaming.AddBundlesRequest & streaming.AddBundlesRequest.$Shape} AddBundlesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.AddBundlesRequest & streaming.AddBundlesRequest.$Shape;

        /**
         * Decodes an AddBundlesRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {streaming.AddBundlesRequest & streaming.AddBundlesRequest.$Shape} AddBundlesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.AddBundlesRequest & streaming.AddBundlesRequest.$Shape;

        /**
         * Verifies an AddBundlesRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an AddBundlesRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns AddBundlesRequest
         */
        static fromObject(object: { [k: string]: any }): streaming.AddBundlesRequest;

        /**
         * Creates a plain object from an AddBundlesRequest message. Also converts values to other types if specified.
         * @param message AddBundlesRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: streaming.AddBundlesRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this AddBundlesRequest to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for AddBundlesRequest
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace AddBundlesRequest {

        /** Properties of an AddBundlesRequest. */
        interface $Properties {

            /** AddBundlesRequest bundleIds */
            bundleIds?: (string[]|null);

            /** AddBundlesRequest userId */
            userId?: (string|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of an AddBundlesRequest. */
        type $Shape = streaming.AddBundlesRequest.$Properties;
    }

    /**
     * Properties of a UserBundleUpdate.
     * @deprecated Use streaming.UserBundleUpdate.$Properties instead.
     */
    interface IUserBundleUpdate extends streaming.UserBundleUpdate.$Properties {
    }

    /** Represents a UserBundleUpdate. */
    class UserBundleUpdate {

        /**
         * Constructs a new UserBundleUpdate.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.UserBundleUpdate.$Properties);

        /** Unknown fields preserved while decoding */
        $unknowns?: Uint8Array[];

        /** UserBundleUpdate bundleId. */
        bundleId: string;

        /** UserBundleUpdate oldStatus. */
        oldStatus: string;

        /** UserBundleUpdate newStatus. */
        newStatus: streaming.BundleStage;

        /** UserBundleUpdate timestamp. */
        timestamp: (number|Long);

        /** UserBundleUpdate slot. */
        slot?: (number|Long|null);

        /**
         * Creates a new UserBundleUpdate instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UserBundleUpdate instance
         */
        static create(properties: streaming.UserBundleUpdate.$Shape): streaming.UserBundleUpdate & streaming.UserBundleUpdate.$Shape;
        static create(properties?: streaming.UserBundleUpdate.$Properties): streaming.UserBundleUpdate;

        /**
         * Encodes the specified UserBundleUpdate message. Does not implicitly {@link streaming.UserBundleUpdate.verify|verify} messages.
         * @param message UserBundleUpdate message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: streaming.UserBundleUpdate.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UserBundleUpdate message, length delimited. Does not implicitly {@link streaming.UserBundleUpdate.verify|verify} messages.
         * @param message UserBundleUpdate message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: streaming.UserBundleUpdate.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a UserBundleUpdate message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {streaming.UserBundleUpdate & streaming.UserBundleUpdate.$Shape} UserBundleUpdate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.UserBundleUpdate & streaming.UserBundleUpdate.$Shape;

        /**
         * Decodes a UserBundleUpdate message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {streaming.UserBundleUpdate & streaming.UserBundleUpdate.$Shape} UserBundleUpdate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.UserBundleUpdate & streaming.UserBundleUpdate.$Shape;

        /**
         * Verifies a UserBundleUpdate message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a UserBundleUpdate message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UserBundleUpdate
         */
        static fromObject(object: { [k: string]: any }): streaming.UserBundleUpdate;

        /**
         * Creates a plain object from a UserBundleUpdate message. Also converts values to other types if specified.
         * @param message UserBundleUpdate
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: streaming.UserBundleUpdate, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UserBundleUpdate to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for UserBundleUpdate
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace UserBundleUpdate {

        /** Properties of a UserBundleUpdate. */
        interface $Properties {

            /** UserBundleUpdate bundleId */
            bundleId?: (string|null);

            /** UserBundleUpdate oldStatus */
            oldStatus?: (string|null);

            /** UserBundleUpdate newStatus */
            newStatus?: (streaming.BundleStage|null);

            /** UserBundleUpdate timestamp */
            timestamp?: (number|Long|null);

            /** UserBundleUpdate slot */
            slot?: (number|Long|null);

            /** Unknown fields preserved while decoding */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a UserBundleUpdate. */
        type $Shape = streaming.UserBundleUpdate.$Properties;
    }

    /** BundleStage enum. */
    enum BundleStage {

        /** BUNDLE_STAGE_UNSPECIFIED value */
        BUNDLE_STAGE_UNSPECIFIED = 0,

        /** BUNDLE_STAGE_SUBMITTED value */
        BUNDLE_STAGE_SUBMITTED = 1,

        /** BUNDLE_STAGE_IN_FLIGHT value */
        BUNDLE_STAGE_IN_FLIGHT = 2,

        /** BUNDLE_STAGE_LANDED value */
        BUNDLE_STAGE_LANDED = 3,

        /** BUNDLE_STAGE_CONFIRMED value */
        BUNDLE_STAGE_CONFIRMED = 4,

        /** BUNDLE_STAGE_FINALIZED value */
        BUNDLE_STAGE_FINALIZED = 5,

        /** BUNDLE_STAGE_FAILED value */
        BUNDLE_STAGE_FAILED = 6
    }
}
