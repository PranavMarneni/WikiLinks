import React from "react";

export default function ChallengeControls() {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex gap-2">
        <button className="px-3 py-1 rounded border border-gray-300 bg-white text-sm">Challenge 1</button>
        <button className="px-3 py-1 rounded border border-gray-300 bg-white text-sm">Challenge 2</button>
        <button className="px-3 py-1 rounded border border-gray-300 bg-white text-sm">Challenge 3</button>
      </div>
      <div className="mt-2 sm:mt-0">
        <button className="px-4 py-1 rounded bg-green-600 text-white text-sm">Start</button>
      </div>
    </div>
  );
}
