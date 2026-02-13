import React, { useState } from "react";
import { Play } from "lucide-react";

export default function ChallengeControls() {
  const [selectedChallenge, setSelectedChallenge] = useState(1);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Challenge buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedChallenge(1)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedChallenge === 1
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
            }`}
          >
            Challenge 1
          </button>
          <button
            onClick={() => setSelectedChallenge(2)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedChallenge === 2
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
            }`}
          >
            Challenge 2
          </button>
          <button
            onClick={() => setSelectedChallenge(3)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedChallenge === 3
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
            }`}
          >
            Challenge 3
          </button>
        </div>

        {/* Start button */}
        <button className="flex items-center gap-2 px-6 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors shadow-sm">
          <Play className="w-4 h-4" />
          Start
        </button>
      </div>
    </div>
  );
}