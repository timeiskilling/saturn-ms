import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Wallet, Coins } from "lucide-react";
import { POPULAR_TOKENS } from "./types";
import { useTokenAccounts } from "@/hooks/useTokenAccounts";
import { useSolanaBalance } from "@/hooks/useSolanaBalance";

interface TokenSelectProps {
  value: string;
  onChange: (value: string) => void;
  isInput?: boolean;
}

export function TokenSelect({
  value,
  onChange,
  isInput = false,
}: TokenSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { tokens: ownedTokens, loading: tokensLoading } = useTokenAccounts();
  const solBalance = useSolanaBalance();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format SOL as a token if we have balance
  const solToken = {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    balance: solBalance !== null ? solBalance.toString() : "0",
    decimals: 9,
  };

  // Combine owned tokens
  const allOwnedTokens = [
    ...(solBalance !== null && solBalance > 0 ? [solToken] : []),
    ...ownedTokens.map((t) => {
      const popularMatch = POPULAR_TOKENS.find((p) => p.mint === t.mint);
      return {
        mint: t.mint,
        symbol: popularMatch?.symbol || "Unknown",
        balance: t.balance,
        decimals: t.decimals,
      };
    }),
  ];

  // For input, we prioritize owned tokens
  const baseTokensForInput =
    allOwnedTokens.length > 0
      ? allOwnedTokens
      : POPULAR_TOKENS.map((t) => ({ ...t, balance: "0", decimals: 0 }));

  const displayTokens = isInput
    ? baseTokensForInput.filter(
        (t) =>
          t.mint.toLowerCase().includes(search.toLowerCase()) ||
          t.symbol.toLowerCase().includes(search.toLowerCase()),
      )
    : POPULAR_TOKENS.filter(
        (t) =>
          t.mint.toLowerCase().includes(search.toLowerCase()) ||
          t.symbol.toLowerCase().includes(search.toLowerCase()),
      );

  // Fallback for custom addresses
  const showCustomOption =
    search.length > 30 && !displayTokens.find((t) => t.mint === search);

  const selectedTokenSymbol =
    POPULAR_TOKENS.find((t) => t.mint === value)?.symbol ||
    allOwnedTokens.find((t) => t.mint === value)?.symbol ||
    "Custom";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          if (!isOpen) setSearch("");
          setIsOpen(!isOpen);
        }}
        onKeyDown={(e) => {
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            setIsOpen(true);
            setSearch(e.key);
          }
        }}
        className="w-full flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none hover:border-zinc-700 focus:border-blue-500 transition-colors"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="font-medium truncate">{selectedTokenSymbol}</span>
          <span className="text-zinc-500 text-xs truncate">
            {value.slice(0, 4)}...{value.slice(-4)}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          tabIndex={-1}
          className="absolute z-50 top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl shadow-black/50 overflow-hidden flex flex-col max-h-[60vh] min-w-70"
        >
          <div className="p-2 border-b border-zinc-800">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                ref={inputRef}
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or paste address"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {isInput ? (
              <div className="w-full min-w-max">
                <div className="flex items-center gap-2 px-3 py-2 bg-zinc-950/50 border-b border-zinc-800/50 sticky top-0 backdrop-blur-sm z-10">
                  <Wallet className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Your Tokens
                  </span>
                </div>

                {tokensLoading ? (
                  <div className="p-4 text-center text-sm text-zinc-500">
                    Loading wallet tokens...
                  </div>
                ) : displayTokens.length > 0 ? (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-900/50 text-zinc-500 text-xs uppercase sticky top-8.25 backdrop-blur-sm z-10 shadow-sm">
                      <tr>
                        <th className="px-3 py-2 font-medium">Token</th>
                        <th className="px-3 py-2 font-medium text-right">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {displayTokens.map((token) => (
                        <tr
                          key={token.mint}
                          onClick={() => {
                            onChange(token.mint);
                            setIsOpen(false);
                          }}
                          className="hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                        >
                          <td className="px-3 py-2.5">
                            <div className="flex flex-col">
                              <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">
                                {token.symbol}
                              </span>
                              <span className="text-[10px] text-zinc-500">
                                {token.mint.slice(0, 8)}...
                                {token.mint.slice(-4)}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <span className="text-zinc-300 font-medium">
                              {Number(
                                "balance" in token ? token.balance : 0,
                              ).toLocaleString(undefined, {
                                maximumFractionDigits: 4,
                              })}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 flex flex-col items-center justify-center text-center">
                    <Coins className="w-8 h-8 text-zinc-700 mb-2" />
                    <p className="text-sm text-zinc-400 font-medium">
                      No tokens found
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Try clearing your search or connect a wallet with
                      balances.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-1 min-w-max">
                <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider sticky top-0 bg-zinc-900/90 backdrop-blur-sm z-10">
                  Popular Tokens
                </div>
                {displayTokens.map((token) => (
                  <div
                    key={token.mint}
                    onClick={() => {
                      onChange(token.mint);
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-between px-2 py-2 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400 shadow-sm">
                        {token.symbol[0]}
                      </div>
                      <span className="text-sm font-medium text-zinc-200">
                        {token.symbol}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500">
                      {token.mint.slice(0, 4)}...{token.mint.slice(-4)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {showCustomOption && (
              <div
                onClick={() => {
                  onChange(search);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-3 hover:bg-zinc-800 cursor-pointer border-t border-zinc-800 mt-1"
              >
                <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <Coins className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-blue-400">
                    Use Custom Address
                  </span>
                  <span className="text-xs text-zinc-500 truncate w-full">
                    {search}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
