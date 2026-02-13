import React from "react";
import { Timer, MousePointer } from "lucide-react";

export default function WikiContainer() {
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
              <div className="text-lg font-semibold tabular-nums">00:00</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Clicks</div>
              <div className="text-lg font-semibold tabular-nums">0</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wikipedia viewer area */}
      <div className="flex-1 bg-gray-50 rounded-lg border-2 border-gray-200 p-8 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl">📖</div>
          <div className="text-gray-500 font-medium">Select a challenge to begin</div>
          <div className="text-sm text-gray-400">Wikipedia content will appear here</div>
        </div>
      </div>
    </div>
  );
}