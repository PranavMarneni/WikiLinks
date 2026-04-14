import React from "react";
import WikiContainer from "./WikiContainer";
import StandingsPanel from "./StandingsPanel";

export default function GameLayout({ challenge, challengeStats, gameStarted, gameComplete, gameKey, onGameComplete, onReset }) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: main wiki viewer (two-thirds on large screens) */}
      <div className="lg:col-span-2">
        <WikiContainer
          challenge={challenge}
          gameStarted={gameStarted}
          gameComplete={gameComplete}
          gameKey={gameKey}
          onGameComplete={onGameComplete}
          onReset={onReset}
        />
      </div>

      {/* Right: standings */}
      <div className="lg:col-span-1">
        <StandingsPanel challengeStats={challengeStats} />
      </div>
    </section>
  );
}
