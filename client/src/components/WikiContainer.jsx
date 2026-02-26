import { Timer, MousePointer } from "lucide-react";
import WikiViewer from "../WikiViewer";
import React, { useState, useEffect, useCallback } from "react";
import CompletionScreen from "./CompletionScreen";

// Placeholder goal
const GOAL_TITLE = "Abraham_Lincoln";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function WikiContainer() {
  const [clicks, setClicks] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  useEffect(() => {
    if (gameComplete) return;
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [gameComplete, gameKey]);

  const handleStep = useCallback(({ from, to }) => {
    console.log("STEP:", from, " to ", to);
    setClicks((prev) => prev + 1);
  }, []);

  const handleNavigate = useCallback((title) => {
    console.log("NAVIGATE TO:", title);
  }, []);

  const handleLoaded = useCallback((title) => {
    console.log("LOADED:", title);
    if (title === GOAL_TITLE) {
      setGameComplete(true);
    }
  }, []);

  function handleReset() {
    setClicks(0);
    setElapsedSeconds(0);
    setGameComplete(false);
    setGameKey((k) => k + 1);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px] p-6 flex flex-col">
      {/* Stats bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-600">Live Challenge</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Time</div>
              <div className="text-lg font-semibold tabular-nums">{formatTime(elapsedSeconds)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Clicks</div>
              <div className="text-lg font-semibold tabular-nums">{clicks}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wikipedia viewer area */}
      <div className="flex-1 bg-gray-50 rounded-lg border-2 border-gray-200 p-4 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {gameComplete ? (
            <CompletionScreen
              clicks={clicks}
              time={formatTime(elapsedSeconds)}
              onPlayAgain={handleReset}
            />
          ) : (
            <WikiViewer
              key={gameKey}
              initialTitle="Georgia_Tech"
              onStep={handleStep}
              onNavigate={handleNavigate}
              onLoaded={handleLoaded}
            />
          )}
        </div>
      </div>
    </div>
  );
}
