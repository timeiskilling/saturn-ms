import { useSolana, useAccounts, usePhantom } from "@phantom/react-sdk";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useEffect, useState } from "react";

export interface TokenAccount {
  mint: string;
  balance: string;
  decimals: number;
}
