import { useEffect } from "react";
import { subscribeToBundles } from "../api/bundle";
import { streaming } from "@/protoTypes/streaming_status";

interface UseBundleSubscriptionProps {
  userPk?: string;
  isAuthenticated: boolean;
  onUpdate: (update: streaming.UserBundleUpdate) => void;
}

export function useBundleSubscription({
  userPk,
  isAuthenticated,
  onUpdate,
}: UseBundleSubscriptionProps) {
  useEffect(() => {
    if (!isAuthenticated || !userPk) return;

    const abortController = new AbortController();

    const startSubscription = async () => {
      try {
        await subscribeToBundles(
          { userPk },
          onUpdate,
          (error) => console.error("Subscription stream failed:", error),
          () => console.log("Subscription stream completed"),
          abortController.signal,
        );
      } catch (err) {
        console.error("Failed to initialize subscription:", err);
      }
    };

    startSubscription();

    return () => {
      abortController.abort();
    };
  }, [isAuthenticated, userPk, onUpdate]);
}
