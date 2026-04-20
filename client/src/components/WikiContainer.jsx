import { Timer, MousePointer, Play } from "lucide-react";
import WikiViewer from "../WikiViewer";
import React, { useState, useEffect, useCallback } from "react";
import CompletionScreen from "./CompletionScreen";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function WikiContainer({
  challenge,
  gameStarted,
  gameComplete,
  onGameComplete,
  onReset
}) {
  const [clicks, setClicks] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // timer
  useEffect(() => {
    if (!gameStarted || gameComplete) return;

    const id = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(id);
  }, [gameStarted, gameComplete]);

  const handleStep = useCallback(() => {
    setClicks((prev) => prev + 1);
  }, []);

  const handleNavigate = useCallback((title) => {
    console.log("NAVIGATE:", title);
  }, []);

  const handleLoaded = useCallback(
    (title) => {
      if (challenge && title === challenge.goal) {
        onGameComplete({ clicks, elapsedSeconds });
      }
    },
    [challenge, clicks, elapsedSeconds, onGameComplete]
  );

  if (!challenge) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        No challenge loaded
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px] p-6 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              gameStarted && !gameComplete
                ? "bg-green-500 animate-pulse"
                : "bg-gray-300"
            }`}
          />
          <span className="text-sm font-medium text-gray-600">
            {gameStarted && !gameComplete
              ? "Live Challenge"
              : gameComplete
              ? "Challenge Over"
              : "Waiting to Start"}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-xs text-gray-500 uppercase">Time</div>
              <div className="text-lg font-semibold tabular-nums">
                {formatTime(elapsedSeconds)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-xs text-gray-500 uppercase">Clicks</div>
              <div className="text-lg font-semibold tabular-nums">
                {clicks}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 bg-gray-50 rounded-lg border-2 border-gray-200 p-4 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {!gameStarted && !gameComplete ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Play className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700">
                  Ready to Play?
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Press <span className="font-medium text-green-600">Start</span> to begin the challenge
                </p>
              </div>
            </div>
          ) : gameComplete ? (
            <CompletionScreen
              clicks={clicks}
              time={formatTime(elapsedSeconds)}
              onPlayAgain={onReset}
            />
          ) : (
            <WikiViewer
              initialTitle={challenge.start}
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