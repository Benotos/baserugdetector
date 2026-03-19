declare global {
  interface Window {
    ethereum?: any;
  }
}
"use client";

import { useState } from "react";
import { createWalletClient, custom, parseEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../lib/contract";

export default function Home() {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [account, setAccount] = useState("");
  const [status, setStatus] = useState("");

  // 🔌 CONNECT WALLET + SWITCH TO BASE
  const connectWallet = async () => {
    if (!window?.ethereum) {
      alert("Install MetaMask or Coinbase Wallet");
      return;
    }

    try {
      // Switch to Base
      await window?.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x2105" }], // 8453
      });
    } catch (switchError: any) {
      // Add Base if not available
      if (switchError.code === 4902) {
        await window?.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x2105",
              chainName: "Base",
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://mainnet.base.org"],
              blockExplorerUrls: ["https://basescan.org"],
            },
          ],
        });
      }
    }

    const client = createWalletClient({
      transport: custom(window?.ethereum),
    });

    const [addr] = await client.requestAddresses();

    setWallet(client);
    setAccount(addr);
  };

  // 🔍 SCAN TOKEN
  const scanToken = async () => {
    if (!address) return alert("Enter token address");

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(
        `https://api.gopluslabs.io/api/v1/token_security/8453?contract_addresses=${address}`
      );

      const data = await res.json();
      const tokenData = data.result?.[address.toLowerCase()];

      if (!tokenData) {
        alert("Token not found");
        setLoading(false);
        return;
      }

      setResult(tokenData);
    } catch (err) {
      console.error(err);
      alert("Scan failed");
    }

    setLoading(false);
  };

  // ⛓️ REPORT RUG
  const reportRug = async () => {
    if (!wallet) return alert("Connect wallet first");

    try {
      setStatus("Waiting for wallet confirmation...");

      const hash = await wallet.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "reportRug",
        args: [address, "Suspicious token"],
        account,
        value: parseEther("0.0001"),
      });

      setStatus("Transaction sent 🚀");

      // Optional: link to explorer
      console.log("TX:", hash);

    } catch (err) {
      console.error(err);
      setStatus("Transaction failed ❌");
    }
  };

  return (
    <main className="min-h-screen bg-black text-green-400 flex flex-col items-center justify-center p-6 space-y-4">
      
      <h1 className="text-3xl font-bold">
        ⚡ BASE RUG DETECTOR
      </h1>

      {/* 🔌 WALLET */}
      <button
        onClick={connectWallet}
        className="border border-green-400 px-4 py-2"
      >
        {account ? account.slice(0, 6) + "..." : "Connect Wallet"}
      </button>

      {/* INPUT */}
      <input
        className="bg-black border border-green-400 p-3 w-full max-w-md"
        placeholder="Enter token address..."
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      {/* SCAN */}
      <button
        onClick={scanToken}
        disabled={loading}
        className="border border-green-400 px-6 py-2 hover:bg-green-400 hover:text-black disabled:opacity-50"
      >
        {loading ? "Scanning..." : "Scan Token"}
      </button>

      {/* RESULTS */}
      {result && (
        <div className="border border-green-400 p-4 w-full max-w-md space-y-2">

          <p>Honeypot: {result.is_honeypot === "1" ? "YES 🚨" : "No"}</p>
          <p>Buy Tax: {result.buy_tax}%</p>
          <p>Sell Tax: {result.sell_tax}%</p>

          <hr className="border-green-400" />

          {/* 🚨 REPORT */}
          <button
            onClick={reportRug}
            className="border border-red-500 text-red-500 px-4 py-2 mt-2 hover:bg-red-500 hover:text-black"
          >
            🚨 Flag as Rug (0.0001 ETH)
          </button>

        </div>
      )}

      {/* STATUS */}
      {status && (
        <p className="text-sm text-yellow-400 mt-2">{status}</p>
      )}
    </main>
  );
}