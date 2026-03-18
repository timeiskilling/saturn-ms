import { bundleService } from "@/protoTypes/grpcClient";
import type { streaming } from "@/protoTypes/streaming_status";

export async function executeBundle(request: streaming.ITransactionsBuld) {
  try {
    const response = await bundleService.createTransactions(request);
    return response;
  } catch (error) {
    console.error("Failed to execute bundle:", error);
    throw error;
  }
}
