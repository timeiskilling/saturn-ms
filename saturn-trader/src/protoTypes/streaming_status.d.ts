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
        public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): BundleService;

        /**
         * Calls SimulateBundle.
         * @param request SimulateBundleRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and BundleDelta
         */
        public simulateBundle(request: streaming.ISimulateBundleRequest, callback: streaming.BundleService.SimulateBundleCallback): void;

        /**
         * Calls SimulateBundle.
         * @param request SimulateBundleRequest message or plain object
         * @returns Promise
         */
        public simulateBundle(request: streaming.ISimulateBundleRequest): Promise<streaming.BundleDelta>;

        /**
         * Calls CreateTransactions.
         * @param request TransactionsBuld message or plain object
         * @param callback Node-style callback called with the error, if any, and TransactionsToSign
         */
        public createTransactions(request: streaming.ITransactionsBuld, callback: streaming.BundleService.CreateTransactionsCallback): void;

        /**
         * Calls CreateTransactions.
         * @param request TransactionsBuld message or plain object
         * @returns Promise
         */
        public createTransactions(request: streaming.ITransactionsBuld): Promise<streaming.TransactionsToSign>;

        /**
         * Calls SendTransactions.
         * @param request SignedTransactions message or plain object
         * @param callback Node-style callback called with the error, if any, and UserBundleUpdate
         */
        public sendTransactions(request: streaming.ISignedTransactions, callback: streaming.BundleService.SendTransactionsCallback): void;

        /**
         * Calls SendTransactions.
         * @param request SignedTransactions message or plain object
         * @returns Promise
         */
        public sendTransactions(request: streaming.ISignedTransactions): Promise<streaming.UserBundleUpdate>;

        /**
         * Calls SubscribeToBundles.
         * @param request UserBundleRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and UserBundleUpdate
         */
        public subscribeToBundles(request: streaming.IUserBundleRequest, callback: streaming.BundleService.SubscribeToBundlesCallback): void;

        /**
         * Calls SubscribeToBundles.
         * @param request UserBundleRequest message or plain object
         * @returns Promise
         */
        public subscribeToBundles(request: streaming.IUserBundleRequest): Promise<streaming.UserBundleUpdate>;
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

    /** Properties of a SimulateBundleRequest. */
    interface ISimulateBundleRequest {

        /** SimulateBundleRequest swaps */
        swaps?: (streaming.ISwapSimulationRequest[]|null);
    }

    /** Represents a SimulateBundleRequest. */
    class SimulateBundleRequest implements ISimulateBundleRequest {

        /**
         * Constructs a new SimulateBundleRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.ISimulateBundleRequest);

        /** SimulateBundleRequest swaps. */
        public swaps: streaming.ISwapSimulationRequest[];

        /**
         * Creates a new SimulateBundleRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SimulateBundleRequest instance
         */
        public static create(properties?: streaming.ISimulateBundleRequest): streaming.SimulateBundleRequest;

        /**
         * Encodes the specified SimulateBundleRequest message. Does not implicitly {@link streaming.SimulateBundleRequest.verify|verify} messages.
         * @param message SimulateBundleRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: streaming.ISimulateBundleRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified SimulateBundleRequest message, length delimited. Does not implicitly {@link streaming.SimulateBundleRequest.verify|verify} messages.
         * @param message SimulateBundleRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: streaming.ISimulateBundleRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SimulateBundleRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns SimulateBundleRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.SimulateBundleRequest;

        /**
         * Decodes a SimulateBundleRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns SimulateBundleRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.SimulateBundleRequest;

        /**
         * Verifies a SimulateBundleRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a SimulateBundleRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns SimulateBundleRequest
         */
        public static fromObject(object: { [k: string]: any }): streaming.SimulateBundleRequest;

        /**
         * Creates a plain object from a SimulateBundleRequest message. Also converts values to other types if specified.
         * @param message SimulateBundleRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: streaming.SimulateBundleRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this SimulateBundleRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for SimulateBundleRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a SwapSimulationRequest. */
    interface ISwapSimulationRequest {

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
    }

    /** Represents a SwapSimulationRequest. */
    class SwapSimulationRequest implements ISwapSimulationRequest {

        /**
         * Constructs a new SwapSimulationRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.ISwapSimulationRequest);

        /** SwapSimulationRequest id. */
        public id: string;

        /** SwapSimulationRequest inputMint. */
        public inputMint: string;

        /** SwapSimulationRequest inputAmount. */
        public inputAmount: (number|Long);

        /** SwapSimulationRequest outputMint. */
        public outputMint: string;

        /** SwapSimulationRequest expectedOutput. */
        public expectedOutput: (number|Long);

        /** SwapSimulationRequest slippageBps. */
        public slippageBps: number;

        /**
         * Creates a new SwapSimulationRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SwapSimulationRequest instance
         */
        public static create(properties?: streaming.ISwapSimulationRequest): streaming.SwapSimulationRequest;

        /**
         * Encodes the specified SwapSimulationRequest message. Does not implicitly {@link streaming.SwapSimulationRequest.verify|verify} messages.
         * @param message SwapSimulationRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: streaming.ISwapSimulationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified SwapSimulationRequest message, length delimited. Does not implicitly {@link streaming.SwapSimulationRequest.verify|verify} messages.
         * @param message SwapSimulationRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: streaming.ISwapSimulationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SwapSimulationRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns SwapSimulationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.SwapSimulationRequest;

        /**
         * Decodes a SwapSimulationRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns SwapSimulationRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.SwapSimulationRequest;

        /**
         * Verifies a SwapSimulationRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a SwapSimulationRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns SwapSimulationRequest
         */
        public static fromObject(object: { [k: string]: any }): streaming.SwapSimulationRequest;

        /**
         * Creates a plain object from a SwapSimulationRequest message. Also converts values to other types if specified.
         * @param message SwapSimulationRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: streaming.SwapSimulationRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this SwapSimulationRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for SwapSimulationRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a UserBundleRequest. */
    interface IUserBundleRequest {

        /** UserBundleRequest userPk */
        userPk?: (string|null);

        /** UserBundleRequest bundleId */
        bundleId?: (string|null);
    }

    /** Represents a UserBundleRequest. */
    class UserBundleRequest implements IUserBundleRequest {

        /**
         * Constructs a new UserBundleRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.IUserBundleRequest);

        /** UserBundleRequest userPk. */
        public userPk: string;

        /** UserBundleRequest bundleId. */
        public bundleId?: (string|null);

        /**
         * Creates a new UserBundleRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UserBundleRequest instance
         */
        public static create(properties?: streaming.IUserBundleRequest): streaming.UserBundleRequest;

        /**
         * Encodes the specified UserBundleRequest message. Does not implicitly {@link streaming.UserBundleRequest.verify|verify} messages.
         * @param message UserBundleRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: streaming.IUserBundleRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UserBundleRequest message, length delimited. Does not implicitly {@link streaming.UserBundleRequest.verify|verify} messages.
         * @param message UserBundleRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: streaming.IUserBundleRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a UserBundleRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns UserBundleRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.UserBundleRequest;

        /**
         * Decodes a UserBundleRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns UserBundleRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.UserBundleRequest;

        /**
         * Verifies a UserBundleRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a UserBundleRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UserBundleRequest
         */
        public static fromObject(object: { [k: string]: any }): streaming.UserBundleRequest;

        /**
         * Creates a plain object from a UserBundleRequest message. Also converts values to other types if specified.
         * @param message UserBundleRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: streaming.UserBundleRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UserBundleRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for UserBundleRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a SignedTransactions. */
    interface ISignedTransactions {

        /** SignedTransactions transactions */
        transactions?: (string[]|null);

        /** SignedTransactions userPk */
        userPk?: (string|null);
    }

    /** Represents a SignedTransactions. */
    class SignedTransactions implements ISignedTransactions {

        /**
         * Constructs a new SignedTransactions.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.ISignedTransactions);

        /** SignedTransactions transactions. */
        public transactions: string[];

        /** SignedTransactions userPk. */
        public userPk: string;

        /**
         * Creates a new SignedTransactions instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SignedTransactions instance
         */
        public static create(properties?: streaming.ISignedTransactions): streaming.SignedTransactions;

        /**
         * Encodes the specified SignedTransactions message. Does not implicitly {@link streaming.SignedTransactions.verify|verify} messages.
         * @param message SignedTransactions message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: streaming.ISignedTransactions, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified SignedTransactions message, length delimited. Does not implicitly {@link streaming.SignedTransactions.verify|verify} messages.
         * @param message SignedTransactions message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: streaming.ISignedTransactions, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SignedTransactions message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns SignedTransactions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.SignedTransactions;

        /**
         * Decodes a SignedTransactions message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns SignedTransactions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.SignedTransactions;

        /**
         * Verifies a SignedTransactions message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a SignedTransactions message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns SignedTransactions
         */
        public static fromObject(object: { [k: string]: any }): streaming.SignedTransactions;

        /**
         * Creates a plain object from a SignedTransactions message. Also converts values to other types if specified.
         * @param message SignedTransactions
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: streaming.SignedTransactions, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this SignedTransactions to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for SignedTransactions
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a BuiltTransaction. */
    interface IBuiltTransaction {

        /** BuiltTransaction id */
        id?: (string|null);

        /** BuiltTransaction transactionBase58 */
        transactionBase58?: (string|null);
    }

    /** Represents a BuiltTransaction. */
    class BuiltTransaction implements IBuiltTransaction {

        /**
         * Constructs a new BuiltTransaction.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.IBuiltTransaction);

        /** BuiltTransaction id. */
        public id: string;

        /** BuiltTransaction transactionBase58. */
        public transactionBase58: string;

        /**
         * Creates a new BuiltTransaction instance using the specified properties.
         * @param [properties] Properties to set
         * @returns BuiltTransaction instance
         */
        public static create(properties?: streaming.IBuiltTransaction): streaming.BuiltTransaction;

        /**
         * Encodes the specified BuiltTransaction message. Does not implicitly {@link streaming.BuiltTransaction.verify|verify} messages.
         * @param message BuiltTransaction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: streaming.IBuiltTransaction, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified BuiltTransaction message, length delimited. Does not implicitly {@link streaming.BuiltTransaction.verify|verify} messages.
         * @param message BuiltTransaction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: streaming.IBuiltTransaction, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a BuiltTransaction message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns BuiltTransaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.BuiltTransaction;

        /**
         * Decodes a BuiltTransaction message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns BuiltTransaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.BuiltTransaction;

        /**
         * Verifies a BuiltTransaction message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a BuiltTransaction message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns BuiltTransaction
         */
        public static fromObject(object: { [k: string]: any }): streaming.BuiltTransaction;

        /**
         * Creates a plain object from a BuiltTransaction message. Also converts values to other types if specified.
         * @param message BuiltTransaction
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: streaming.BuiltTransaction, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this BuiltTransaction to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for BuiltTransaction
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a TransactionsToSign. */
    interface ITransactionsToSign {

        /** TransactionsToSign transactions */
        transactions?: (streaming.IBuiltTransaction[]|null);
    }

    /** Represents a TransactionsToSign. */
    class TransactionsToSign implements ITransactionsToSign {

        /**
         * Constructs a new TransactionsToSign.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.ITransactionsToSign);

        /** TransactionsToSign transactions. */
        public transactions: streaming.IBuiltTransaction[];

        /**
         * Creates a new TransactionsToSign instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransactionsToSign instance
         */
        public static create(properties?: streaming.ITransactionsToSign): streaming.TransactionsToSign;

        /**
         * Encodes the specified TransactionsToSign message. Does not implicitly {@link streaming.TransactionsToSign.verify|verify} messages.
         * @param message TransactionsToSign message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: streaming.ITransactionsToSign, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TransactionsToSign message, length delimited. Does not implicitly {@link streaming.TransactionsToSign.verify|verify} messages.
         * @param message TransactionsToSign message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: streaming.ITransactionsToSign, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransactionsToSign message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TransactionsToSign
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.TransactionsToSign;

        /**
         * Decodes a TransactionsToSign message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TransactionsToSign
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.TransactionsToSign;

        /**
         * Verifies a TransactionsToSign message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TransactionsToSign message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TransactionsToSign
         */
        public static fromObject(object: { [k: string]: any }): streaming.TransactionsToSign;

        /**
         * Creates a plain object from a TransactionsToSign message. Also converts values to other types if specified.
         * @param message TransactionsToSign
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: streaming.TransactionsToSign, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TransactionsToSign to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TransactionsToSign
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a BundleDelta. */
    interface IBundleDelta {

        /** BundleDelta swaps */
        swaps?: (streaming.ITransactionDelta[]|null);

        /** BundleDelta jitoTipLamports */
        jitoTipLamports?: (number|Long|null);

        /** BundleDelta totalNetworkFeeLamports */
        totalNetworkFeeLamports?: (number|Long|null);
    }

    /** Represents a BundleDelta. */
    class BundleDelta implements IBundleDelta {

        /**
         * Constructs a new BundleDelta.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.IBundleDelta);

        /** BundleDelta swaps. */
        public swaps: streaming.ITransactionDelta[];

        /** BundleDelta jitoTipLamports. */
        public jitoTipLamports: (number|Long);

        /** BundleDelta totalNetworkFeeLamports. */
        public totalNetworkFeeLamports: (number|Long);

        /**
         * Creates a new BundleDelta instance using the specified properties.
         * @param [properties] Properties to set
         * @returns BundleDelta instance
         */
        public static create(properties?: streaming.IBundleDelta): streaming.BundleDelta;

        /**
         * Encodes the specified BundleDelta message. Does not implicitly {@link streaming.BundleDelta.verify|verify} messages.
         * @param message BundleDelta message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: streaming.IBundleDelta, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified BundleDelta message, length delimited. Does not implicitly {@link streaming.BundleDelta.verify|verify} messages.
         * @param message BundleDelta message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: streaming.IBundleDelta, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a BundleDelta message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns BundleDelta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.BundleDelta;

        /**
         * Decodes a BundleDelta message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns BundleDelta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.BundleDelta;

        /**
         * Verifies a BundleDelta message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a BundleDelta message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns BundleDelta
         */
        public static fromObject(object: { [k: string]: any }): streaming.BundleDelta;

        /**
         * Creates a plain object from a BundleDelta message. Also converts values to other types if specified.
         * @param message BundleDelta
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: streaming.BundleDelta, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this BundleDelta to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for BundleDelta
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a TransactionDelta. */
    interface ITransactionDelta {

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
    }

    /** Represents a TransactionDelta. */
    class TransactionDelta implements ITransactionDelta {

        /**
         * Constructs a new TransactionDelta.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.ITransactionDelta);

        /** TransactionDelta inputMint. */
        public inputMint: string;

        /** TransactionDelta inputAmount. */
        public inputAmount: (number|Long);

        /** TransactionDelta outputMint. */
        public outputMint: string;

        /** TransactionDelta expectedOutput. */
        public expectedOutput: (number|Long);

        /** TransactionDelta minimumOutput. */
        public minimumOutput: (number|Long);

        /** TransactionDelta jitoTipLamports. */
        public jitoTipLamports: (number|Long);

        /** TransactionDelta networkFeeLamports. */
        public networkFeeLamports: (number|Long);

        /** TransactionDelta platformFeeBps. */
        public platformFeeBps: number;

        /** TransactionDelta id. */
        public id: string;

        /**
         * Creates a new TransactionDelta instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransactionDelta instance
         */
        public static create(properties?: streaming.ITransactionDelta): streaming.TransactionDelta;

        /**
         * Encodes the specified TransactionDelta message. Does not implicitly {@link streaming.TransactionDelta.verify|verify} messages.
         * @param message TransactionDelta message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: streaming.ITransactionDelta, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TransactionDelta message, length delimited. Does not implicitly {@link streaming.TransactionDelta.verify|verify} messages.
         * @param message TransactionDelta message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: streaming.ITransactionDelta, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransactionDelta message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TransactionDelta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.TransactionDelta;

        /**
         * Decodes a TransactionDelta message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TransactionDelta
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.TransactionDelta;

        /**
         * Verifies a TransactionDelta message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TransactionDelta message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TransactionDelta
         */
        public static fromObject(object: { [k: string]: any }): streaming.TransactionDelta;

        /**
         * Creates a plain object from a TransactionDelta message. Also converts values to other types if specified.
         * @param message TransactionDelta
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: streaming.TransactionDelta, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TransactionDelta to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TransactionDelta
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a TransactionsBuld. */
    interface ITransactionsBuld {

        /** TransactionsBuld transactions */
        transactions?: (streaming.ITrasnactionInstruction[]|null);
    }

    /** Represents a TransactionsBuld. */
    class TransactionsBuld implements ITransactionsBuld {

        /**
         * Constructs a new TransactionsBuld.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.ITransactionsBuld);

        /** TransactionsBuld transactions. */
        public transactions: streaming.ITrasnactionInstruction[];

        /**
         * Creates a new TransactionsBuld instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransactionsBuld instance
         */
        public static create(properties?: streaming.ITransactionsBuld): streaming.TransactionsBuld;

        /**
         * Encodes the specified TransactionsBuld message. Does not implicitly {@link streaming.TransactionsBuld.verify|verify} messages.
         * @param message TransactionsBuld message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: streaming.ITransactionsBuld, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TransactionsBuld message, length delimited. Does not implicitly {@link streaming.TransactionsBuld.verify|verify} messages.
         * @param message TransactionsBuld message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: streaming.ITransactionsBuld, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransactionsBuld message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TransactionsBuld
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.TransactionsBuld;

        /**
         * Decodes a TransactionsBuld message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TransactionsBuld
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.TransactionsBuld;

        /**
         * Verifies a TransactionsBuld message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TransactionsBuld message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TransactionsBuld
         */
        public static fromObject(object: { [k: string]: any }): streaming.TransactionsBuld;

        /**
         * Creates a plain object from a TransactionsBuld message. Also converts values to other types if specified.
         * @param message TransactionsBuld
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: streaming.TransactionsBuld, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TransactionsBuld to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TransactionsBuld
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a TrasnactionInstruction. */
    interface ITrasnactionInstruction {

        /** TrasnactionInstruction inputMint */
        inputMint?: (string|null);

        /** TrasnactionInstruction outputMint */
        outputMint?: (string|null);

        /** TrasnactionInstruction amount */
        amount?: (number|Long|null);

        /** TrasnactionInstruction slippageBps */
        slippageBps?: (number|null);

        /** TrasnactionInstruction options */
        options?: (streaming.IQuoteOptions|null);

        /** TrasnactionInstruction userPk */
        userPk?: (string|null);

        /** TrasnactionInstruction id */
        id?: (string|null);
    }

    /** Represents a TrasnactionInstruction. */
    class TrasnactionInstruction implements ITrasnactionInstruction {

        /**
         * Constructs a new TrasnactionInstruction.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.ITrasnactionInstruction);

        /** TrasnactionInstruction inputMint. */
        public inputMint: string;

        /** TrasnactionInstruction outputMint. */
        public outputMint: string;

        /** TrasnactionInstruction amount. */
        public amount: (number|Long);

        /** TrasnactionInstruction slippageBps. */
        public slippageBps: number;

        /** TrasnactionInstruction options. */
        public options?: (streaming.IQuoteOptions|null);

        /** TrasnactionInstruction userPk. */
        public userPk: string;

        /** TrasnactionInstruction id. */
        public id: string;

        /**
         * Creates a new TrasnactionInstruction instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TrasnactionInstruction instance
         */
        public static create(properties?: streaming.ITrasnactionInstruction): streaming.TrasnactionInstruction;

        /**
         * Encodes the specified TrasnactionInstruction message. Does not implicitly {@link streaming.TrasnactionInstruction.verify|verify} messages.
         * @param message TrasnactionInstruction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: streaming.ITrasnactionInstruction, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TrasnactionInstruction message, length delimited. Does not implicitly {@link streaming.TrasnactionInstruction.verify|verify} messages.
         * @param message TrasnactionInstruction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: streaming.ITrasnactionInstruction, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TrasnactionInstruction message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TrasnactionInstruction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.TrasnactionInstruction;

        /**
         * Decodes a TrasnactionInstruction message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TrasnactionInstruction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.TrasnactionInstruction;

        /**
         * Verifies a TrasnactionInstruction message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TrasnactionInstruction message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TrasnactionInstruction
         */
        public static fromObject(object: { [k: string]: any }): streaming.TrasnactionInstruction;

        /**
         * Creates a plain object from a TrasnactionInstruction message. Also converts values to other types if specified.
         * @param message TrasnactionInstruction
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: streaming.TrasnactionInstruction, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TrasnactionInstruction to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TrasnactionInstruction
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a QuoteOptions. */
    interface IQuoteOptions {

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
    }

    /** Represents a QuoteOptions. */
    class QuoteOptions implements IQuoteOptions {

        /**
         * Constructs a new QuoteOptions.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.IQuoteOptions);

        /** QuoteOptions swapMode. */
        public swapMode?: (number|null);

        /** QuoteOptions dexes. */
        public dexes: string[];

        /** QuoteOptions excludeDexes. */
        public excludeDexes: string[];

        /** QuoteOptions dynamicSlippage. */
        public dynamicSlippage?: (boolean|null);

        /** QuoteOptions restrictIntermediateTokens. */
        public restrictIntermediateTokens?: (boolean|null);

        /** QuoteOptions onlyDirectRoutes. */
        public onlyDirectRoutes?: (boolean|null);

        /** QuoteOptions asLegacyTransaction. */
        public asLegacyTransaction?: (boolean|null);

        /** QuoteOptions maxAccounts. */
        public maxAccounts?: (number|null);

        /** QuoteOptions blockhashSlotsToExpiry. */
        public blockhashSlotsToExpiry?: (number|null);

        /**
         * Creates a new QuoteOptions instance using the specified properties.
         * @param [properties] Properties to set
         * @returns QuoteOptions instance
         */
        public static create(properties?: streaming.IQuoteOptions): streaming.QuoteOptions;

        /**
         * Encodes the specified QuoteOptions message. Does not implicitly {@link streaming.QuoteOptions.verify|verify} messages.
         * @param message QuoteOptions message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: streaming.IQuoteOptions, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified QuoteOptions message, length delimited. Does not implicitly {@link streaming.QuoteOptions.verify|verify} messages.
         * @param message QuoteOptions message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: streaming.IQuoteOptions, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a QuoteOptions message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns QuoteOptions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.QuoteOptions;

        /**
         * Decodes a QuoteOptions message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns QuoteOptions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.QuoteOptions;

        /**
         * Verifies a QuoteOptions message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a QuoteOptions message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns QuoteOptions
         */
        public static fromObject(object: { [k: string]: any }): streaming.QuoteOptions;

        /**
         * Creates a plain object from a QuoteOptions message. Also converts values to other types if specified.
         * @param message QuoteOptions
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: streaming.QuoteOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this QuoteOptions to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for QuoteOptions
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an Empty. */
    interface IEmpty {
    }

    /** Represents an Empty. */
    class Empty implements IEmpty {

        /**
         * Constructs a new Empty.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.IEmpty);

        /**
         * Creates a new Empty instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Empty instance
         */
        public static create(properties?: streaming.IEmpty): streaming.Empty;

        /**
         * Encodes the specified Empty message. Does not implicitly {@link streaming.Empty.verify|verify} messages.
         * @param message Empty message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: streaming.IEmpty, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Empty message, length delimited. Does not implicitly {@link streaming.Empty.verify|verify} messages.
         * @param message Empty message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: streaming.IEmpty, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Empty message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Empty
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.Empty;

        /**
         * Decodes an Empty message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Empty
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.Empty;

        /**
         * Verifies an Empty message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Empty message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Empty
         */
        public static fromObject(object: { [k: string]: any }): streaming.Empty;

        /**
         * Creates a plain object from an Empty message. Also converts values to other types if specified.
         * @param message Empty
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: streaming.Empty, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Empty to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Empty
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a CoinsData. */
    interface ICoinsData {

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
    }

    /** Represents a CoinsData. */
    class CoinsData implements ICoinsData {

        /**
         * Constructs a new CoinsData.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.ICoinsData);

        /** CoinsData price. */
        public price: string;

        /** CoinsData changePercent. */
        public changePercent: string;

        /** CoinsData imageUrl. */
        public imageUrl: string;

        /** CoinsData rank. */
        public rank?: (number|null);

        /** CoinsData coinName. */
        public coinName: string;

        /**
         * Creates a new CoinsData instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CoinsData instance
         */
        public static create(properties?: streaming.ICoinsData): streaming.CoinsData;

        /**
         * Encodes the specified CoinsData message. Does not implicitly {@link streaming.CoinsData.verify|verify} messages.
         * @param message CoinsData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: streaming.ICoinsData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CoinsData message, length delimited. Does not implicitly {@link streaming.CoinsData.verify|verify} messages.
         * @param message CoinsData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: streaming.ICoinsData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CoinsData message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CoinsData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.CoinsData;

        /**
         * Decodes a CoinsData message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CoinsData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.CoinsData;

        /**
         * Verifies a CoinsData message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CoinsData message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CoinsData
         */
        public static fromObject(object: { [k: string]: any }): streaming.CoinsData;

        /**
         * Creates a plain object from a CoinsData message. Also converts values to other types if specified.
         * @param message CoinsData
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: streaming.CoinsData, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CoinsData to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CoinsData
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an AddBundlesRequest. */
    interface IAddBundlesRequest {

        /** AddBundlesRequest bundleIds */
        bundleIds?: (string[]|null);

        /** AddBundlesRequest userId */
        userId?: (string|null);
    }

    /** Represents an AddBundlesRequest. */
    class AddBundlesRequest implements IAddBundlesRequest {

        /**
         * Constructs a new AddBundlesRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.IAddBundlesRequest);

        /** AddBundlesRequest bundleIds. */
        public bundleIds: string[];

        /** AddBundlesRequest userId. */
        public userId: string;

        /**
         * Creates a new AddBundlesRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns AddBundlesRequest instance
         */
        public static create(properties?: streaming.IAddBundlesRequest): streaming.AddBundlesRequest;

        /**
         * Encodes the specified AddBundlesRequest message. Does not implicitly {@link streaming.AddBundlesRequest.verify|verify} messages.
         * @param message AddBundlesRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: streaming.IAddBundlesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified AddBundlesRequest message, length delimited. Does not implicitly {@link streaming.AddBundlesRequest.verify|verify} messages.
         * @param message AddBundlesRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: streaming.IAddBundlesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an AddBundlesRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns AddBundlesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.AddBundlesRequest;

        /**
         * Decodes an AddBundlesRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns AddBundlesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.AddBundlesRequest;

        /**
         * Verifies an AddBundlesRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an AddBundlesRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns AddBundlesRequest
         */
        public static fromObject(object: { [k: string]: any }): streaming.AddBundlesRequest;

        /**
         * Creates a plain object from an AddBundlesRequest message. Also converts values to other types if specified.
         * @param message AddBundlesRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: streaming.AddBundlesRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this AddBundlesRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for AddBundlesRequest
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a UserBundleUpdate. */
    interface IUserBundleUpdate {

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
    }

    /** Represents a UserBundleUpdate. */
    class UserBundleUpdate implements IUserBundleUpdate {

        /**
         * Constructs a new UserBundleUpdate.
         * @param [properties] Properties to set
         */
        constructor(properties?: streaming.IUserBundleUpdate);

        /** UserBundleUpdate bundleId. */
        public bundleId: string;

        /** UserBundleUpdate oldStatus. */
        public oldStatus: string;

        /** UserBundleUpdate newStatus. */
        public newStatus: streaming.BundleStage;

        /** UserBundleUpdate timestamp. */
        public timestamp: (number|Long);

        /** UserBundleUpdate slot. */
        public slot?: (number|Long|null);

        /**
         * Creates a new UserBundleUpdate instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UserBundleUpdate instance
         */
        public static create(properties?: streaming.IUserBundleUpdate): streaming.UserBundleUpdate;

        /**
         * Encodes the specified UserBundleUpdate message. Does not implicitly {@link streaming.UserBundleUpdate.verify|verify} messages.
         * @param message UserBundleUpdate message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: streaming.IUserBundleUpdate, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UserBundleUpdate message, length delimited. Does not implicitly {@link streaming.UserBundleUpdate.verify|verify} messages.
         * @param message UserBundleUpdate message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: streaming.IUserBundleUpdate, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a UserBundleUpdate message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns UserBundleUpdate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): streaming.UserBundleUpdate;

        /**
         * Decodes a UserBundleUpdate message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns UserBundleUpdate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): streaming.UserBundleUpdate;

        /**
         * Verifies a UserBundleUpdate message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a UserBundleUpdate message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UserBundleUpdate
         */
        public static fromObject(object: { [k: string]: any }): streaming.UserBundleUpdate;

        /**
         * Creates a plain object from a UserBundleUpdate message. Also converts values to other types if specified.
         * @param message UserBundleUpdate
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: streaming.UserBundleUpdate, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UserBundleUpdate to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for UserBundleUpdate
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** BundleStage enum. */
    enum BundleStage {
        BUNDLE_STAGE_UNSPECIFIED = 0,
        BUNDLE_STAGE_SUBMITTED = 1,
        BUNDLE_STAGE_IN_FLIGHT = 2,
        BUNDLE_STAGE_LANDED = 3,
        BUNDLE_STAGE_CONFIRMED = 4,
        BUNDLE_STAGE_FINALIZED = 5,
        BUNDLE_STAGE_FAILED = 6
    }
}
