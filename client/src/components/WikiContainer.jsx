import { Timer, MousePointer, ArrowLeft, Loader2 } from "lucide-react";
import WikiViewer from "../WikiViewer";
import React, { useState, useEffect } from "react";

export default function WikiContainer() {
  const [challenges, setChallenges] = useState([]);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [clicks, setClicks] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDailyChallenges = async () => {
      try {

        const response = await fetch("http://localhost:3001/api/challenges");
        if (!response.ok) {
          throw new Error("Failed to fetch challenges");
        }
        const data = await response.json();
        setChallenges(data.challenges);
      } catch (err) {
        console.error("Error fetching challenges:", err);
        setError("Could not load today's challenges. Run backend");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyChallenges();
  }, []);

  const startChallenge = (challenge) => {
    setActiveChallenge(challenge);
    setClicks(0); 
  };

  const quitChallenge = () => {
    setActiveChallenge(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px] p-6 flex flex-col">
      
      {/* LOADING STATE */}
      {isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p>Loading today's challenges...</p>
        </div>
      )}

      {/* ERROR STATE */}
      {error && !isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center text-red-500">
          <p>{error}</p>
        </div>
      )}

      {/* 1. CHALLENGE SELECTION SCREEN */}
      {!isLoading && !error && !activeChallenge && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Today's Daily Challenges</h2>
          <div className="grid gap-4 w-full max-w-md">
            {challenges.map((challenge, index) => (
              <button
                key={index}
                onClick={() => startChallenge(challenge)}
                className="p-5 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center flex items-center justify-center"
              >
                <span className="text-lg text-gray-700">
                  <span className="font-semibold text-gray-900">{challenge.start.replace(/_/g, " ")}</span>
                  <span className="mx-3 text-gray-400">→</span>
                  <span className="font-semibold text-gray-900">{challenge.end.replace(/_/g, " ")}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. ACTIVE CHALLENGE SCREEN */}
      {activeChallenge && (
        <>
          {/* Stats bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <button 
                onClick={quitChallenge}
                className="p-1 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
                title="Back to menu"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-600">
                  Target: <span className="font-bold text-gray-900">{activeChallenge.end.replace(/_/g, " ")}</span>
                </span>
              </div>
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
                  <div className="text-lg font-semibold tabular-nums">{clicks}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Wikipedia viewer area */}
          <div className="flex-1 bg-gray-50 rounded-lg border-2 border-gray-200 p-4 overflow-hidden">
            <div className="h-full overflow-y-auto">
              <WikiViewer
                key={activeChallenge.start} 
                initialTitle={activeChallenge.start}
                onStep={({ from, to }) => {
                  console.log("STEP:", from, " to ", to);
                  setClicks((prev) => prev + 1);
                }}
                onNavigate={(title) => {
                  console.log("NAVIGATE TO:", title);
                }}
                onLoaded={(title) => {
                  console.log("LOADED:", title);
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}