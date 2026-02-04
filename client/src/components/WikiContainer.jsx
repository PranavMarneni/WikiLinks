import React from "react";

export default function WikiContainer() {
  return (
    <div className="bg-white rounded-lg shadow min-h-[420px] p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-semibold">Wikipedia Viewer</h3>
        <div className="flex items-center gap-6 text-sm">
          <div>
            <div className="text-xs text-gray-500">Timer</div>
            <div className="text-lg font-medium">00:00</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Clicks</div>
            <div className="text-lg font-medium">0</div>
          </div>
        </div>
      </div>

      <div className="flex-1 border-2 border-dashed border-gray-200 rounded-md p-4 text-gray-500 flex items-center justify-center">
        {/* Empty container for future iframe / viewer component */}
        <span>Wikipedia goes here!</span>
      </div>
    </div>
  );
}