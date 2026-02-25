import React from "react";
import { Trophy, Clock, MousePointer, RotateCcw } from "lucide-react";

export default function CompletionScreen({ clicks, time, onPlayAgain }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center space-y-8">
      {/* Trophy icon */}
      <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center">
        <Trophy className="w-10 h-10 text-yellow-500" />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Goal Page Found!</h2>
        <p className="text-gray-500">Check the leaderboard to see where you stacked up</p>
      </div>

      {/* Stats */}
      <div className="flex gap-6">
        <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl px-8 py-5 border border-gray-200">
          <Clock className="w-6 h-6 text-gray-400" />
          <div className="text-3xl font-bold tabular-nums text-gray-900">{time}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Time</div>
        </div>

        <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl px-8 py-5 border border-gray-200">
          <MousePointer className="w-6 h-6 text-gray-400" />
          <div className="text-3xl font-bold tabular-nums text-gray-900">{clicks}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Clicks</div>
        </div>
      </div>

      {/* Play again */}
      <button
        onClick={onPlayAgain}
        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Play Again
      </button>
    </div>
  );
}
