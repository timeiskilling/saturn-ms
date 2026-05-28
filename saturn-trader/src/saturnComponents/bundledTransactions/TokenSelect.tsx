import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Wallet, Coins } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { POPULAR_TOKENS, type TransactionInstruction } from "./types";
import { useAllWalletsBalances } from "@/hooks/useAllWalletsBalances";
import { useTokenList } from "@/hooks/useTokenList";
import { useNestedScrollbar } from "@/hooks/useNestedScrollbar";
import { useDiscoveredWallets } from "@phantom/react-sdk";
import { TokenIcon } from "../TokenIcon";

interface TokenSelectProps {
  value: string;
  onChange: (value: string) => void;
  isInput?: boolean;
  minimalistic?: boolean;
  transactions?: TransactionInstruction[];
  index?: number;
  walletAddress?: string;
  onWalletChange?: (address: string) => void;
  align?: "left" | "right";
}

export function TokenSelect({
  value,
  onChange,
  isInput = false,
  minimalistic = false,
  transactions = [],
  index = 0,
  walletAddress,
  onWalletChange,
  align = "left",
}: TokenSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { wallets: discoveredWallets } = useDiscoveredWallets();
  const { balances, loading: tokensLoading } = useAllWalletsBalances();
  const { tokens: allTokens } = useTokenList();

  const scrollContainerRef = useNestedScrollbar(isOpen);

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

  const solMint = "So11111111111111111111111111111111111111112";

  const allOwnedTokensByWallet = useMemo(() => {
    return Object.values(balances).map((wallet) => {
      let initialWalletTokens: Array<{
        mint: string;
        symbol: string;
        balance: string;
        decimals: number;
        icon: string | undefined;
      }> = [
        ...(wallet.solBalance !== null && wallet.solBalance > 0
          ? [
              {
                mint: solMint,
                symbol: "SOL",
                balance: wallet.solBalance.toString(),
                decimals: 9,
                icon: allTokens.find((t) => t.mint === solMint)?.icon,
              },
            ]
          : []),
        ...wallet.tokens.map((t) => {
          const popularMatch = POPULAR_TOKENS.find((p) => p.mint === t.mint);
          const allListMatch = allTokens.find((p) => p.mint === t.mint);
          return {
            mint: t.mint,
            symbol: popularMatch?.symbol || allListMatch?.symbol || "Unknown",
            balance: t.balance,
            decimals: t.decimals,
            icon: allListMatch?.icon,
          };
        }),
      ];

      // Optimistic Balance Simulation
      let walletTokens: Array<{
        mint: string;
        symbol: string;
        balance: string;
        decimals: number;
        icon: string | undefined;
        realBalance?: string;
      }> = initialWalletTokens.map((token) => {
        let simulatedBalance = parseFloat(token.balance);
        for (let i = 0; i < index; i++) {
          const tx = transactions[i] as TransactionInstruction;
          if (!tx) continue;
          if (
            (tx.userPk && tx.userPk === wallet.address) ||
            (!tx.userPk && walletAddress === wallet.address) ||
            (!tx.userPk && !walletAddress)
          ) {
            if (tx.inputMint === token.mint) {
              simulatedBalance -= parseFloat(tx.amount || "0");
            }
            if (tx.outputMint === token.mint && tx.calculatedOutput) {
              simulatedBalance += parseFloat(tx.calculatedOutput || "0");
            }
          }
        }

        return {
          ...token,
          realBalance: token.balance,
          balance: Math.max(0, simulatedBalance).toString(),
        };
      });

      // Add tokens that we didn't have but received in previous steps
      for (let i = 0; i < index; i++) {
        const tx = transactions[i] as TransactionInstruction;
        if (!tx) continue;
        if (
          (tx.userPk && tx.userPk === wallet.address) ||
          (!tx.userPk && walletAddress === wallet.address) ||
          (!tx.userPk && !walletAddress)
        ) {
          if (tx.calculatedOutput && parseFloat(tx.calculatedOutput) > 0) {
            const existingToken = walletTokens.find(
              (t) => t.mint === tx.outputMint,
            );
            if (!existingToken) {
              const popularMatch = POPULAR_TOKENS.find(
                (p) => p.mint === tx.outputMint,
              );
              const allListMatch = allTokens.find(
                (p) => p.mint === tx.outputMint,
              );
              walletTokens.push({
                mint: tx.outputMint,
                symbol:
                  popularMatch?.symbol || allListMatch?.symbol || "Unknown",
                balance: tx.calculatedOutput,
                realBalance: "0",
                decimals: popularMatch?.decimals || 9,
                icon: allListMatch?.icon,
              } as any);
            }
          }
        }
      }

      return {
        ...wallet,
        tokens: walletTokens,
      };
    });
  }, [balances, allTokens, transactions, index, walletAddress]);

  const sourceTokens = useMemo(
    () => (allTokens.length > 0 ? allTokens : POPULAR_TOKENS),
    [allTokens],
  );

  const displayTokensByWallet = useMemo(() => {
    if (!isInput) return [];
    return allOwnedTokensByWallet
      .map((wallet) => ({
        ...wallet,
        tokens: wallet.tokens
          .filter(
            (t) =>
              t.mint.toLowerCase().includes(search.toLowerCase()) ||
              t.symbol.toLowerCase().includes(search.toLowerCase()),
          )
          .slice(0, 20),
      }))
      .filter((wallet) => wallet.tokens.length > 0);
  }, [isInput, allOwnedTokensByWallet, search]);

  const displaySourceTokens = useMemo(() => {
    // ВАЖЛИВО: Прибрано логіку return [], щоб популярні токени завжди були доступні
    return sourceTokens
      .filter(
        (t) =>
          t.mint.toLowerCase().includes(search.toLowerCase()) ||
          t.symbol.toLowerCase().includes(search.toLowerCase()),
      )
      .filter(
        (token) =>
          // Відфільтровуємо дублікати (якщо токен вже є у гаманці, не показуємо його знову знизу)
          !displayTokensByWallet.some((wallet) =>
            wallet.tokens.some((t) => t.mint === token.mint),
          ),
      )
      .slice(0, 20);
  }, [displayTokensByWallet, sourceTokens, search]);

  const showCustomOption = useMemo(
    () =>
      search.length > 20 &&
      !displaySourceTokens.find((t) => t.mint === search) &&
      !displayTokensByWallet.some((w) =>
        w.tokens.find((t) => t.mint === search),
      ),
    [search, displaySourceTokens, displayTokensByWallet],
  );

  const selectedTokenSymbol = useMemo(
    () =>
      allTokens.find((t) => t.mint === value)?.symbol ||
      POPULAR_TOKENS.find((t) => t.mint === value)?.symbol ||
      allOwnedTokensByWallet
        .flatMap((w) => w.tokens)
        .find((t) => t.mint === value)?.symbol ||
      "Custom",
    [allTokens, value, allOwnedTokensByWallet],
  );

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
        className={
          minimalistic
            ? "flex items-center gap-2 hover:bg-zinc-800/50 rounded-lg py-1 text-xl text-zinc-100 outline-none transition-colors"
            : "w-full flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none hover:border-zinc-700 focus:border-blue-500 transition-colors"
        }
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="font-medium truncate">{selectedTokenSymbol}</span>

          <span className="text-zinc-500 text-xs truncate">
            {value.slice(0, 4)}...
            {value.slice(-4)}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.985 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute z-50 top-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col w-[min(400px,calc(100vw-24px))] max-w-[calc(100vw-24px)] ${
              align === "right" ? "right-0" : "left-0"
            }`}
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

            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-hidden max-h-[60vh] overflow-y-auto"
            >
              {isInput ? (
                <div className="w-full min-w-max pb-2">
                  {tokensLoading && (
                    <div className="p-4 text-center text-sm text-zinc-500">
                      Loading wallet tokens...
                    </div>
                  )}

                  {!tokensLoading &&
                    displayTokensByWallet.length > 0 &&
                    displayTokensByWallet.map((wallet) => (
                      <div key={wallet.walletId} className="mb-2">
                        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-950 border-y border-zinc-800/50 sticky top-0 z-10">
                          {wallet.icon ||
                          discoveredWallets.find(
                            (w) =>
                              w.name === wallet.name ||
                              w.id === wallet.walletId,
                          )?.icon ? (
                            <img
                              src={
                                wallet.icon ||
                                discoveredWallets.find(
                                  (w) =>
                                    w.name === wallet.name ||
                                    w.id === wallet.walletId,
                                )?.icon
                              }
                              alt={wallet.name}
                              className="w-4 h-4 rounded-sm object-cover bg-white"
                            />
                          ) : (
                            <Wallet className="w-3.5 h-3.5 text-blue-400" />
                          )}

                          <span className="text-xs font-semibold text-zinc-400 tracking-wider">
                            ({wallet.address.slice(0, 4)}...
                            {wallet.address.slice(-4)})
                          </span>
                        </div>

                        {/* ВІДНОВЛЕНА ТАБЛИЦЯ */}
                        <table className="w-full text-left text-sm">
                          <thead className="bg-zinc-900 text-zinc-500 text-xs uppercase shadow-sm">
                            <tr>
                              <th className="px-3 py-2 font-medium">Token</th>
                              <th className="px-3 py-2 font-medium text-right">
                                Balance
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800/50">
                            {wallet.tokens.map((token: any) => {
                              const isSimulated =
                                token.realBalance &&
                                token.balance !== token.realBalance;
                              const diff =
                                parseFloat(token.balance) -
                                parseFloat(token.realBalance || "0");

                              return (
                                <motion.tr
                                  key={token.mint}
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.14 }}
                                  onClick={() => {
                                    onChange(token.mint);
                                    if (onWalletChange) {
                                      onWalletChange(wallet.address);
                                    }
                                    setIsOpen(false);
                                  }}
                                  className="hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                                >
                                  <td className="px-3 py-2.5">
                                    <div className="flex items-center gap-2">
                                      <TokenIcon
                                        token={token}
                                        className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700/50 shrink-0 text-xs font-bold text-zinc-400 overflow-hidden shadow-sm object-cover"
                                      />
                                      <div className="flex flex-col">
                                        <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">
                                          {token.symbol}
                                        </span>
                                        <span className="text-[10px] text-zinc-500">
                                          {token.mint.slice(0, 8)}...
                                          {token.mint.slice(-4)}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="px-3 py-2.5 text-right">
                                    <div className="flex flex-col items-end">
                                      <span className="text-zinc-300 font-medium">
                                        {Number(token.balance).toLocaleString(
                                          undefined,
                                          {
                                            maximumFractionDigits: 6,
                                          },
                                        )}
                                      </span>

                                      {isSimulated && (
                                        <motion.span
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          className={`text-[10px] ${
                                            diff > 0
                                              ? "text-green-400"
                                              : "text-red-400"
                                          }`}
                                        >
                                          (
                                          {Number(
                                            token.realBalance,
                                          ).toLocaleString(undefined, {
                                            maximumFractionDigits: 4,
                                          })}
                                          {" in wallet "}
                                          {diff > 0 ? "+" : "-"}{" "}
                                          {Math.abs(diff).toLocaleString(
                                            undefined,
                                            {
                                              maximumFractionDigits: 4,
                                            },
                                          )}
                                          {" from step"}
                                          {index === 1 ? " 1" : "s"})
                                        </motion.span>
                                      )}
                                    </div>
                                  </td>
                                </motion.tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ))}

                  {!tokensLoading && displaySourceTokens.length > 0 && (
                    <div className="p-1 min-w-max mt-1">
                      <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider sticky top-0 bg-zinc-900 z-10 border-t border-zinc-800/50 pt-2">
                        Popular Tokens
                      </div>
                      {displaySourceTokens.map((token) => (
                        <div
                          key={token.mint}
                          onClick={() => {
                            onChange(token.mint);
                            setIsOpen(false);
                          }}
                          className="flex items-center justify-between px-2 py-2 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <TokenIcon
                              token={token as any}
                              className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700/50 shrink-0 text-xs font-bold text-zinc-400 overflow-hidden shadow-sm object-cover"
                            />
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

                  {!tokensLoading &&
                    displayTokensByWallet.length === 0 &&
                    displaySourceTokens.length === 0 &&
                    !showCustomOption && (
                      <div className="p-6 flex flex-col items-center justify-center text-center">
                        <Coins className="w-8 h-8 text-zinc-700 mb-2 opacity-50" />
                        <span className="text-zinc-500 text-sm">
                          No tokens found
                        </span>
                      </div>
                    )}
                </div>
              ) : (
                /* ВИГЛЯД, КОЛИ ЦЕ НЕ INPUT (наприклад Output токен) */
                <div className="p-1 min-w-max">
                  <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider sticky top-0 bg-zinc-900 z-10">
                    Popular Tokens
                  </div>

                  {displaySourceTokens.map((token) => (
                    <div
                      key={token.mint}
                      onClick={() => {
                        onChange(token.mint);
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-between px-2 py-2 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <TokenIcon
                          token={token as any}
                          className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700/50 shrink-0 text-xs font-bold text-zinc-400 overflow-hidden shadow-sm object-cover"
                        />
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

              {/* 4. CUSTOM ADDRESS OPTION */}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
