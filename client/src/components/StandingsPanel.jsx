import React from "react";

export default function StandingsPanel() {
  return (
    <div className="bg-white rounded-lg shadow p-6 min-h-[420px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-semibold">Daily Standings</h3>
        <span className="text-sm text-gray-500">Live / Placeholder</span>
      </div>

      <div className="space-y-3">
        {/* Placeholder empty state or list items */}
        <div className="text-sm text-gray-600">No standings yet. Players will appear here.</div>

        {/* Example placeholder list */}
        <ul className="divide-y divide-gray-100 mt-3">
          <li className="py-2 text-sm text-gray-700">—</li>
          <li className="py-2 text-sm text-gray-700">—</li>
          <li className="py-2 text-sm text-gray-700">—</li>
        </ul>
      </div>
    </div>
  );
}
