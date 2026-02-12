import React from "react";
import { X } from "lucide-react";

export default function Instructions({ onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fadeIn">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Content */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">How to Play</h2>
            
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-2">🎯 The Goal</h3>
                <p className="text-sm leading-relaxed">
                  Get from one Wikipedia page to another in as few link clicks as possible.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">📖 How It Works</h3>
                <ul className="text-sm space-y-2 leading-relaxed">
                  <li>• Click any link within the Wikipedia article to navigate</li>
                  <li>• Each click adds to your total count</li>
                  <li>• Reach the target page in the fewest clicks to win</li>
                  <li>• Your time and click count are tracked. With clicks being the main metric with time as the tiebreaker</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">🏆 Compete</h3>
                <p className="text-sm leading-relaxed">
                  Play daily challenges and compete against players worldwide. Can you find the shortest path?
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Let's Play!
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}