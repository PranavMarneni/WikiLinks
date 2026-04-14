import React from "react";
import { Play, ArrowRight } from "lucide-react";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function ChallengeControls({
  challenges,
  challengeStats,
  selectedChallenge,
  gameStarted,
  gameComplete,
  onSelectChallenge,
  onStart,
}) {
  const inProgress = gameStarted && !gameComplete;
  const current = challenges[selectedChallenge];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Left: challenge selector + route info */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {challenges.map((c, idx) => {
              const stats = challengeStats[idx];
              return (
                <div key={c.id} className="flex flex-col items-center gap-0.5">
                  <button
                    onClick={() => onSelectChallenge(idx)}
                    disabled={inProgress}
                    title={inProgress ? "Finish the current challenge first" : undefined}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      selectedChallenge === idx
                        ? "bg-gray-900 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                    } ${inProgress ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    {c.name}
                  </button>
                  {stats && (
                    <span className="text-xs text-gray-500">
                      {formatTime(stats.elapsedSeconds)} · {stats.clicks} clicks
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {current && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-800">{current.startLabel}</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-800">{current.goalLabel}</span>
            </div>
          )}
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          disabled={inProgress}
          className={`flex items-center gap-2 px-6 py-2 rounded-md bg-green-600 text-white text-sm font-medium transition-colors shadow-sm ${
            inProgress ? "opacity-40 cursor-not-allowed" : "hover:bg-green-700"
          }`}
        >
          <Play className="w-4 h-4" />
          Start
        </button>
      </div>
    </div>
  );
}
