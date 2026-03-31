import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import Header from "./components/Header";
import Instructions from "./components/Instructions";
import GameLayout from "./components/GameLayout";
import ChallengeControls from "./components/ChallengeControls";
import challenges from "./challenges";

export default function App() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [challengeStats, setChallengeStats] = useState(() => challenges.map(() => null));

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleStart() {
    setGameStarted(true);
  }

  function handleSelectChallenge(idx) {
    setSelectedChallenge(idx);
    setGameStarted(false);
    setGameComplete(false);
    setGameKey((k) => k + 1);
  }

  function handleGameComplete({ clicks, elapsedSeconds }) {
    setGameComplete(true);
    setChallengeStats((prev) => {
      const next = [...prev];
      next[selectedChallenge] = { clicks, elapsedSeconds };
      return next;
    });
  }

  function handleReset() {
    setGameStarted(false);
    setGameComplete(false);
    setGameKey((k) => k + 1);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header onOpenInstructions={() => setShowInstructions(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <ChallengeControls
          challenges={challenges}
          challengeStats={challengeStats}
          selectedChallenge={selectedChallenge}
          gameStarted={gameStarted}
          gameComplete={gameComplete}
          onSelectChallenge={handleSelectChallenge}
          onStart={handleStart}
        />
        <GameLayout
          challenge={challenges[selectedChallenge]}
          challengeStats={challengeStats}
          gameStarted={gameStarted}
          gameComplete={gameComplete}
          gameKey={gameKey}
          onGameComplete={handleGameComplete}
          onReset={handleReset}
        />
      </main>

      {showInstructions && (
        <Instructions onClose={() => setShowInstructions(false)} />
      )}

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-gray-900 text-white shadow-lg flex items-center justify-center hover:bg-gray-700 transition-colors z-50"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
