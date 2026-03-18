import { streaming } from "./streaming_status";

export interface GrpcClientConfig {
  /** The base URL of the gRPC-Web server (e.g. "https://api.saturn.com") */
  baseUrl: string;
  /** Optional custom headers to send with every request (e.g. Authorization tokens) */
  headers?: Record<string, string>;
}

/**
 * Creates a generic RPC implementation compatible with protobufjs and gRPC-Web.
 *
 * This implementation wraps the standard fetch API and handles the 5-byte
 * length-prefixed framing required by the gRPC-Web specification.
 */
function createGrpcWebRpcImpl(config: GrpcClientConfig, servicePath: string) {
  // Return the callback function format expected by protobufjs Service.create()
  return function rpcImpl(
    method: any, // protobufjs Method descriptor or function
    requestData: Uint8Array,
    callback: (error: Error | null, responseData: Uint8Array | null) => void,
  ) {
    // 1. Construct the gRPC-Web endpoint path.
    // Format: baseUrl/Package.Service/Method
    const methodName = method.name;

    const url = `${config.baseUrl}/${servicePath}/${methodName}`;

    // 2. Prepare the 5-byte gRPC-Web header
    // [0]   = Compression flag (0 = none)
    // [1-4] = Payload length (Big Endian)
    const grpcHeader = new Uint8Array(5);
    grpcHeader[0] = 0; // Uncompressed
    const view = new DataView(grpcHeader.buffer);
    view.setUint32(1, requestData.length, false);

    // 3. Combine header and payload into a single buffer
    const body = new Uint8Array(grpcHeader.length + requestData.length);
    body.set(grpcHeader, 0);
    body.set(requestData, 5);

    // 4. Merge default headers with custom user headers
    const requestHeaders = {
      "Content-Type": "application/grpc-web+proto",
      "X-Grpc-Web": "1",
      Accept: "application/grpc-web+proto",
      ...config.headers,
    };

    // 5. Execute the HTTP POST request
    fetch(url, {
      method: "POST",
      headers: requestHeaders,
      body: body,
    })
      .then(async (res) => {
        const grpcStatus = res.headers.get("grpc-status");
        const grpcMessage = res.headers.get("grpc-message");

        if (!res.ok || (grpcStatus && grpcStatus !== "0")) {
          // Attempt to extract gRPC status message from headers if present
          const errorMsg = grpcMessage
            ? decodeURIComponent(grpcMessage)
            : `HTTP ${res.status}`;
          throw new Error(`gRPC Error (status ${grpcStatus}): ${errorMsg}`);
        }

        const arrayBuffer = await res.arrayBuffer();
        const responseBytes = new Uint8Array(arrayBuffer);

        // 6. Decode the gRPC-Web response framing
        // For simple Unary requests, we extract the payload after the first 5 bytes.
        // Note: Production streams/trailers require more complex parsing of multiple frames.
        if (responseBytes.length >= 5) {
          // Extract the actual protobuf response payload
          const payloadLength = new DataView(
            responseBytes.buffer,
            responseBytes.byteOffset,
            5,
          ).getUint32(1, false);

          const payload = responseBytes.slice(5, 5 + payloadLength);
          callback(null, payload);
        } else {
          callback(new Error("Invalid or empty gRPC-Web response"), null);
        }
      })
      .catch((err) => {
        callback(err instanceof Error ? err : new Error(String(err)), null);
      });
  };
}

/**
 * A strongly-typed factory class to instantiate gRPC services
 * with unified configuration.
 */
export class GrpcClient {
  private config: GrpcClientConfig;

  constructor(config: GrpcClientConfig) {
    // Trim trailing slashes from the base URL
    this.config = {
      ...config,
      baseUrl: config.baseUrl.replace(/\/+$/, ""),
    };
  }

  /**
   * Initializes the BundleService client linked to this configuration.
   */
  public getBundleService() {
    const rpcImpl = createGrpcWebRpcImpl(
      this.config,
      "streaming.BundleService",
    );
    return streaming.BundleService.create(rpcImpl);
  }

  // Add getters for future services here:
  // public getUserService() {
  //   return user.UserService.create(this.rpcImpl);
  // }
}

// Create a default instance pointing to your backend
export const defaultGrpcClient = new GrpcClient({
  baseUrl: "http://127.0.0.1:3000", // Replace with actual backend URL
  // headers: { "Authorization": "Bearer ..." } // Optional
});

// Export the ready-to-use services
export const bundleService = defaultGrpcClient.getBundleService();
