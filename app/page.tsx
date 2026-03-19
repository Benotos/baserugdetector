"use client";

import { useState } from "react";

export default function Home() {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🔥 Improved Risk Calculation
  const calculateRisk = (result: any) => {
    let score = 0;

    if (result?.is_honeypot === "1") score += 70;

    if (parseFloat(result?.buy_tax || "0") > 5) score += 10;
    if (parseFloat(result?.sell_tax || "0") > 5) score += 15;

    if (result?.can_take_back_ownership === "1") score += 30;

    if (result?.is_proxy === "1") score += 10;
    if (result?.is_blacklisted === "1") score += 20;

    return Math.min(score, 100);
  };

  // 🔍 Scan Function
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
        alert("Token not found or not supported");
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

  return (
    <main className="min-h-screen bg-black text-green-400 flex flex-col items-center justify-center p-6">
      
      <h1 className="text-3xl font-bold mb-6">
        ⚡ BASE RUG DETECTOR
      </h1>

      {/* INPUT */}
      <input
        className="bg-black border border-green-400 p-3 w-full max-w-md mb-4"
        placeholder="Enter Base token contract address..."
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      {/* BUTTON */}
      <button
        onClick={scanToken}
        className="border border-green-400 px-6 py-2 hover:bg-green-400 hover:text-black"
      >
        {loading ? "Scanning..." : "Scan Token"}
      </button>

      {/* RESULTS */}
      {result && (
        <div className="mt-6 border border-green-400 p-4 w-full max-w-md space-y-2">

          <p>Honeypot: {result.is_honeypot === "1" ? "YES 🚨" : "No"}</p>
          <p>Buy Tax: {result.buy_tax}%</p>
          <p>Sell Tax: {result.sell_tax}%</p>
          <p>Mintable: {result.can_take_back_ownership === "1" ? "YES ⚠️" : "No"}</p>
          <p>Proxy Contract: {result.is_proxy === "1" ? "YES ⚠️" : "No"}</p>
          <p>Blacklist Function: {result.is_blacklisted === "1" ? "YES 🚨" : "No"}</p>

          <hr className="my-3 border-green-400" />

          {/* RISK SCORE */}
          {(() => {
            const score = calculateRisk(result);

            return (
              <>
                <p className="text-lg font-bold">Risk Score: {score}/100</p>

                {score > 60 && (
                  <p className="text-red-500 font-bold">🚨 HIGH RISK</p>
                )}

                {score <= 60 && score > 30 && (
                  <p className="text-yellow-400 font-bold">⚠️ MEDIUM RISK</p>
                )}

                {score <= 30 && (
                  <p className="text-green-400 font-bold">✅ LOW RISK</p>
                )}

                {score === 0 && (
                  <p className="text-yellow-400 text-sm">
                    ⚠️ No obvious risks detected — NOT guaranteed safe
                  </p>
                )}
              </>
            );
          })()}

        </div>
      )}
    </main>
  );
}