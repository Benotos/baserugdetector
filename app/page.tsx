"use client";

import { useState } from "react";

export default function Home() {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const scanToken = async () => {
    if (!address) return alert("Enter token address");

    setLoading(true);

    try {
      const res = await fetch(
        `https://api.gopluslabs.io/api/v1/token_security/8453?contract_addresses=${address}`
      );

      const data = await res.json();
      const tokenData = data.result[address.toLowerCase()];

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

      <input
        className="bg-black border border-green-400 p-3 w-full max-w-md mb-4"
        placeholder="Enter token address..."
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <button
        onClick={scanToken}
        className="border border-green-400 px-6 py-2 hover:bg-green-400 hover:text-black"
      >
        {loading ? "Scanning..." : "Scan Token"}
      </button>

      {result && (
        <div className="mt-6 border border-green-400 p-4 w-full max-w-md">
          <p>Honeypot: {result.is_honeypot === "1" ? "YES 🚨" : "No"}</p>
          <p>Buy Tax: {result.buy_tax}%</p>
          <p>Sell Tax: {result.sell_tax}%</p>
          <p>Mintable: {result.can_take_back_ownership === "1" ? "YES" : "No"}</p>
        </div>
      )}
    </main>
  );
}