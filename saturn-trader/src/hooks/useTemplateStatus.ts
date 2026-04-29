import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { streaming } from "@/protoTypes/streaming_status";
import type { TemplateStatus } from "@/saturnComponents/bundledTransactions";

const SUCCESS_DISMISS_MS = 5_000;

export function useTemplateStatus(
  templateName: string,
  status?: TemplateStatus,
) {
  const [isSuccessExpired, setIsSuccessExpired] = useState(false);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasShownSuccess = useRef(false);
  const notifiedError = useRef<string | null>(null);

  const isExecuting = status?.isLoading ?? false;
  const isFailed =
    status?.stage === streaming.BundleStage.BUNDLE_STAGE_FAILED ||
    !!status?.error;
  const isSuccessRaw =
    status?.stage === streaming.BundleStage.BUNDLE_STAGE_FINALIZED ||
    status?.stage === streaming.BundleStage.BUNDLE_STAGE_CONFIRMED;

  useEffect(() => {
    if (isSuccessRaw && !isSuccessExpired) {
      if (!hasShownSuccess.current) {
        toast.success(`Template "${templateName}" executed successfully!`, {
          id: `success-${templateName}`, 
        });
        hasShownSuccess.current = true;
      }

      if (!successTimer.current) {
        successTimer.current = setTimeout(() => {
          setIsSuccessExpired(true);
          successTimer.current = null;
        }, SUCCESS_DISMISS_MS);
      }
    }

    if (isFailed) {
      const errorMark = status?.error || "rejected";

      if (notifiedError.current !== errorMark) {
        toast.error(`You rejected template: "${templateName}"`, {
          id: `error-${templateName}`, 
        });
        notifiedError.current = errorMark;
      }
    }

    if (isExecuting && !isSuccessRaw && !isFailed) {
      if (successTimer.current) {
        clearTimeout(successTimer.current);
        successTimer.current = null;
      }
      setIsSuccessExpired(false);
      hasShownSuccess.current = false;
      notifiedError.current = null;
    }

    return () => {
      if (successTimer.current) {
        clearTimeout(successTimer.current);
        successTimer.current = null;
      }
    };
  }, [
    isSuccessRaw,
    isFailed,
    isExecuting,
    isSuccessExpired,
    status?.stage,
    status?.error,
    templateName,
  ]);

  const isSuccess = isSuccessRaw && !isSuccessExpired;

  let stageText = "";
  if (isExecuting || (status && !isSuccessRaw && !isFailed)) {
    switch (status?.stage) {
      case streaming.BundleStage.BUNDLE_STAGE_SUBMITTED:
        stageText = "Submitted";
        break;
      case streaming.BundleStage.BUNDLE_STAGE_IN_FLIGHT:
        stageText = "In Flight";
        break;
      case streaming.BundleStage.BUNDLE_STAGE_LANDED:
        stageText = "Landed";
        break;
      case streaming.BundleStage.BUNDLE_STAGE_CONFIRMED:
        stageText = "Confirmed";
        break;
      default:
        stageText = "Executing";
        break;
    }
  } else if (isSuccess) {
    stageText = "Success";
  } else if (isFailed) {
    stageText = "Failed";
  }

  let fillPct = 0;
  if (status) {
    switch (status.stage) {
      case streaming.BundleStage.BUNDLE_STAGE_SUBMITTED:
        fillPct = 25;
        break;
      case streaming.BundleStage.BUNDLE_STAGE_IN_FLIGHT:
        fillPct = 55;
        break;
      case streaming.BundleStage.BUNDLE_STAGE_LANDED:
        fillPct = 75;
        break;
      case streaming.BundleStage.BUNDLE_STAGE_CONFIRMED:
        fillPct = 90;
        break;
      case streaming.BundleStage.BUNDLE_STAGE_FINALIZED:
        fillPct = 100;
        break;
      default:
        fillPct = status.isLoading ? 12 : 0;
        break;
    }
  }

  return {
    isSuccess,
    isFailed,
    isExecuting,
    isSuccessExpired,
    stageText,
    fillPct,
  };
}
