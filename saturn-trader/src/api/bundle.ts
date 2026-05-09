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

/**
 * Custom fetch implementation for gRPC-Web streaming since the default
 * protobufjs RPC implementation doesn't support streams out of the box.
 */
export async function sendBundleStream(
  request: streaming.ISignedTransactions,
  onUpdate: (update: streaming.UserBundleUpdate) => void,
  onError: (error: Error) => void,
  onComplete: () => void,
) {
  if (!navigator.onLine) {
    toast.error("You are offline. Please check your internet connection.");
    onError(new Error("Offline"));
    return;
  }
  try {
    // 1. Encode the request to protobuf format
    const requestBytes = streaming.SignedTransactions.encode(request).finish();

    // 2. Prepare the gRPC-Web framing header (5 bytes: 1 byte flags + 4 bytes length)
    const grpcHeader = new Uint8Array(5);
    grpcHeader[0] = 0; // 0 = uncompressed data
    const view = new DataView(grpcHeader.buffer);
    view.setUint32(1, requestBytes.length, false);

    // Combine header and payload
    const body = new Uint8Array(5 + requestBytes.length);
    body.set(grpcHeader, 0);
    body.set(requestBytes, 5);

    // Send the custom fetch request
    const url = `${appConfig.grpcBaseUrl}/streaming.BundleService/SendTransactions`;
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
      throw new Error(`HTTP Error: ${res.status}`);
    }

    if (!res.body) {
      throw new Error("No response body available for streaming");
    }

    const reader = res.body.getReader();
    let buffer = new Uint8Array(0);

    // 3. Process the stream chunks
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log("Stream reader done.");
        break;
      }

      console.log(`Received stream chunk of size ${value.length}`);

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

        console.log(
          `Parsed frame header: flags=${flags}, msgLength=${msgLength}, buffer length=${buffer.length}`,
        );

        // Check if we have received the full message defined by this frame
        if (buffer.length >= 5 + msgLength) {
          const frame = buffer.slice(5, 5 + msgLength);
          buffer = buffer.slice(5 + msgLength);

          console.log(`Processing frame of size ${msgLength}`);

          // 0x00 indicates a standard data frame
          if (flags === 0x00) {
            try {
              const update = streaming.UserBundleUpdate.decode(frame);
              console.log("Successfully decoded UserBundleUpdate:", update);
              onUpdate(update);
            } catch (e) {
              console.error("Failed to decode UserBundleUpdate", e);
            }
          }
          // Note: flags === 0x80 indicates trailers (like grpc-status) which we can skip for now
        } else {
          console.log(
            `Waiting for more data. Need ${5 + msgLength}, have ${buffer.length}`,
          );
          // Not enough data for the full message yet, wait for the next chunk
          break;
        }
      }
    }

    onComplete();
  } catch (error) {
    console.error("Bundle stream error:", error);
    onError(error instanceof Error ? error : new Error(String(error)));
  }
}
