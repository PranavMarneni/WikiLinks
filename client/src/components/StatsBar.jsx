import React from "react";

export default function StatsBar() {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center gap-6">
      <div className="text-sm">
        <div className="text-xs text-gray-500">Timer</div>
        <div className="text-lg font-medium">00:00</div>
      </div>

      <div className="text-sm">
        <div className="text-xs text-gray-500">Clicks</div>
        <div className="text-lg font-medium">0</div>
      </div>

      <div className="text-sm hidden sm:block">
        <div className="text-xs text-gray-500">Status</div>
        <div className="text-lg font-medium text-gray-600">Not started</div>
      </div>
    </div>
  );
}