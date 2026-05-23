import { appConfig } from "@/config/appConfig";
import { bundleService } from "@/protoTypes/grpcClient";
import { streaming } from "@/protoTypes/streaming_status";
import { toast } from "sonner";

export async function simulateBundle(
  request: streaming.ISimulateBundleRequest,
) {
  if (!navigator.onLine) {
    toast.error("You are offline. Please check your internet connection.");
    throw new Error("Offline");
  }
  try {
    const response = await bundleService.simulateBundle(request);
    return response;
  } catch (error) {
    console.error("Failed to simulate bundle:", error);
    throw error;
  }
}

export async function executeBundle(request: streaming.ITransactionsBuld) {
  if (!navigator.onLine) {
    toast.error("You are offline. Please check your internet connection.");
    throw new Error("Offline");
  }
  try {
    const response = await bundleService.createTransactions(request);
    return response;
  } catch (error) {
    console.error("Failed to execute bundle:", error);
    throw error;
  }
}

interface StreamGrpcParams<TReq, TRes> {
  request: TReq;
  endpoint: string;
  encode: (req: TReq) => Uint8Array;
  decode: (frame: Uint8Array) => TRes;
  onUpdate: (update: TRes) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
}

export async function executeGrpcStream<TReq, TRes>({
  request,
  endpoint,
  encode,
  decode,
  onUpdate,
  onError,
  onComplete,
}: StreamGrpcParams<TReq, TRes>) {
  if (!navigator.onLine) {
    toast.error("You are offline. Please check your internet connection.");
    onError(new Error("Offline"));
    return;
  }

  try {
    // 1. Encode the request using the provided encode function
    const requestBytes = encode(request);

    // 2. Prepare the gRPC-Web framing header
    const grpcHeader = new Uint8Array(5);
    grpcHeader[0] = 0; // 0 = uncompressed data
    const view = new DataView(grpcHeader.buffer);
    view.setUint32(1, requestBytes.length, false);

    const body = new Uint8Array(5 + requestBytes.length);
    body.set(grpcHeader, 0);
    body.set(requestBytes, 5);

    const url = `${appConfig.grpcBaseUrl}${endpoint}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/grpc-web+proto",
        "X-Grpc-Web": "1",
        Accept: "application/grpc-web+proto",
      },
      body: body,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    if (!res.body) {
      throw new Error("No response body available for streaming");
    }

    const reader = res.body.getReader();
    let buffer = new Uint8Array(0);

    // 3. Process the stream chunks
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Append new data to the ongoing buffer
      const newBuffer = new Uint8Array(buffer.length + value.length);
      newBuffer.set(buffer);
      newBuffer.set(value, buffer.length);
      buffer = newBuffer;

      // 4. Parse gRPC-Web frames from the buffer
      while (buffer.length >= 5) {
        const flags = buffer[0];
        const lengthView = new DataView(
          buffer.buffer,
          buffer.byteOffset,
          buffer.byteLength,
        );
        const msgLength = lengthView.getUint32(1, false);

        // Check if we have received the full message
        if (buffer.length >= 5 + msgLength) {
          const frame = buffer.slice(5, 5 + msgLength);
          buffer = buffer.slice(5 + msgLength);

          // 0x00 indicates a standard data frame
          if (flags === 0x00) {
            try {
              const update = decode(frame);
              onUpdate(update);
            } catch (e) {
              console.error("Failed to decode stream update", e);
            }
          }
        } else {
          // Not enough data for the full message yet, wait for the next chunk
          break;
        }
      }
    }

    onComplete();
  } catch (error) {
    console.error("gRPC stream error:", error);
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}

export async function subscribeToBundles(
  request: streaming.IUserBundleRequest,
  onUpdate: (update: streaming.UserBundleUpdate) => void,
  onError: (error: Error) => void,
  onComplete: () => void,
) {
  return executeGrpcStream({
    request,
    endpoint: "/streaming.BundleService/UserBundleRequest",
    encode: (req) => streaming.UserBundleRequest.encode(req).finish(),
    decode: (frame) => streaming.UserBundleUpdate.decode(frame),
    onUpdate,
    onError,
    onComplete,
  });
}

export async function sendBundleStream(
  request: streaming.ISignedTransactions,
  onUpdate: (update: streaming.UserBundleUpdate) => void,
  onError: (error: Error) => void,
  onComplete: () => void,
) {
  return executeGrpcStream({
    request,
    endpoint: "/streaming.BundleService/SendTransactions",
    encode: (req) => streaming.SignedTransactions.encode(req).finish(),
    decode: (frame) => streaming.UserBundleUpdate.decode(frame),
    onUpdate,
    onError,
    onComplete,
  });
}
