import React from "react";

export default function WikiContainer() {
  return (
    <div className="bg-white rounded-lg shadow min-h-[420px] p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-semibold">Wikipedia Viewer</h3>
        <span className="text-sm text-gray-500">Placeholder</span>
      </div>

      <div className="flex-1 border-2 border-dashed border-gray-200 rounded-md p-4 text-gray-500 flex items-center justify-center">
        {/* Empty container for future iframe / viewer component */}
        <span>Wikipedia content will appear here (placeholder)</span>
      </div>
    </div>
  );
}
