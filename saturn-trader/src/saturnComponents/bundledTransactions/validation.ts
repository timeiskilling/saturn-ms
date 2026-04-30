import { type Template } from "./types";

export interface ValidationResult {
  isTemplateEmpty: boolean;
  hasZeroAmount: boolean;
  isInsufficientBalance: boolean;
  isExecuteDisabled: boolean;
}

export function validateTemplateExecution(
  template: Template,
  balances?: Record<string, any>,
  globalActiveAddress?: string,
  isExecuting?: boolean,
): ValidationResult {
  const hasZeroAmount = template.transactions.some(
    (tx) => tx.amount === "0" || tx.amount === "",
  );
  const isTemplateEmpty = template.transactions.length === 0;

  let isInsufficientBalance = false;
  if (balances && !isTemplateEmpty) {
    const bundleWalletAddress =
      template.transactions[0]?.userPk || globalActiveAddress;
    const activeWallet = Object.values(balances).find(
      (w) => w.address === bundleWalletAddress,
    );

    if (activeWallet) {
      const simulatedBalances: Record<string, number> = {};

      if (activeWallet.solBalance !== null) {
        simulatedBalances["So11111111111111111111111111111111111111112"] =
          activeWallet.solBalance;
      }
      activeWallet.tokens?.forEach((t: any) => {
        if (
          t.mint !== "So11111111111111111111111111111111111111112" ||
          !simulatedBalances[t.mint]
        ) {
          simulatedBalances[t.mint] = parseFloat(t.balance);
        }
      });

      for (const tx of template.transactions) {
        const amount = parseFloat(tx.amount || "0");
        const currentBalance = simulatedBalances[tx.inputMint] || 0;

        if (amount > currentBalance) {
          isInsufficientBalance = true;
          break;
        }

        simulatedBalances[tx.inputMint] = currentBalance - amount;

        if (tx.calculatedOutput) {
          simulatedBalances[tx.outputMint] =
            (simulatedBalances[tx.outputMint] || 0) +
            parseFloat(tx.calculatedOutput);
        }
      }
    } else {
      isInsufficientBalance = true;
    }
  }

  const isExecuteDisabled =
    !!isExecuting || isTemplateEmpty || hasZeroAmount || isInsufficientBalance;

  return {
    isTemplateEmpty,
    hasZeroAmount,
    isInsufficientBalance,
    isExecuteDisabled,
  };
}
