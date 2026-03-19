"use client";

import { useState } from "react";

export default function Home() {
  const [address, setAddress] = useState("");

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

      <button className="border border-green-400 px-6 py-2 hover:bg-green-400 hover:text-black">
        Scan Token
      </button>

    </main>
  );
}