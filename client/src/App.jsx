import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import Header from "./components/Header";
import Instructions from "./components/Instructions";
import GameLayout from "./components/GameLayout";
import ChallengeControls from "./components/ChallengeControls";

export default function App() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [challenges, setChallenges] = useState([]);
  const [challengeStats, setChallengeStats] = useState([]);

  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(0);
  const [gameKey, setGameKey] = useState(0);

  // fetch challenges from backend
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/challenges");
        const data = await res.json();

        const formatted = data.challenges.map((c, i) => ({
          id: i + 1,
          name: `Challenge ${i + 1}`,
          start: c.start,
          goal: c.end,
          startLabel: c.start.replace(/_/g, " "),
          goalLabel: c.end.replace(/_/g, " "),
        }));

        setChallenges(formatted);

      } catch (err) {
        console.error("Failed to load challenges:", err);
      }
    };

    fetchChallenges();
  }, []);

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

  // loading state
  if (challenges.length === 0) {
    return <div className="p-10 text-center">Loading challenges...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header onOpenInstructions={() => setShowInstructions(true)} />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
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
          className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}