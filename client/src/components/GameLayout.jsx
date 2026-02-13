import React from "react";
import WikiContainer from "./WikiContainer";
import StandingsPanel from "./StandingsPanel";

export default function GameLayout() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: main wiki viewer (two-thirds on large screens) */}
      <div className="lg:col-span-2">
        <WikiContainer />
      </div>

      {/* Right: standings */}
      <div className="lg:col-span-1">
        <StandingsPanel />
      </div>
    </section>
  );
}