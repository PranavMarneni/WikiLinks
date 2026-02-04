import React from "react";

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 style={{ fontFamily: "'EB Garamond', serif" }} className="text-4xl font-bold">WikiLinks</h1>
          </div>
          <div className="flex items-center space-x-3">
            {/* Profile / Login placeholder (non-functional) */}
            <button
              className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
              aria-disabled
            >
              Login
            </button>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm text-gray-500">
              {/* profile placeholder */}
              A
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
