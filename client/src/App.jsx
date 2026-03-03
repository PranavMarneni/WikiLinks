import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import Header from "./components/Header";
import Instructions from "./components/Instructions";
import GameLayout from "./components/GameLayout";
import ChallengeControls from "./components/ChallengeControls";

export default function App() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header onOpenInstructions={() => setShowInstructions(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <ChallengeControls />
        <GameLayout />
      </main>

      {/* Instructions Modal */}
      {showInstructions && (
        <Instructions onClose={() => setShowInstructions(false)} />
      )}

      {/* Scroll to top button */}
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