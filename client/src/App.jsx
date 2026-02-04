import React from "react";
import Header from "./components/Header";
import Instructions from "./components/Instructions";
import GameLayout from "./components/GameLayout";
import ChallengeControls from "./components/ChallengeControls";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Instructions />
        <GameLayout />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <ChallengeControls />
        </div>
      </main>
    </div>
  );
}
