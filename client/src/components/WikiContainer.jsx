import { Timer, MousePointer, Play, ArrowLeft, Loader2 } from "lucide-react";
import WikiViewer from "../WikiViewer";
import React, { useState, useEffect, useCallback } from "react";
import CompletionScreen from "./CompletionScreen";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function WikiContainer({
  challenge,
  gameStarted,
  gameComplete,
  gameKey,
  onGameComplete,
  onReset
}) {
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  const [clicks, setClicks] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------------- FETCH 3 CHALLENGES ----------------
  useEffect(() => {
    const fetchDailyChallenges = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/challenges");
        if (!response.ok) throw new Error("Failed to fetch challenges");

        const data = await response.json();

        // ONLY TAKE 3 PAIRS
        setChallenges(data.challenges.slice(0, 3));
      } catch (err) {
        console.error(err);
        setError("Could not load today's challenges. Run backend");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyChallenges();
  }, []);

  // ---------------- KEEP YOUR RESET LOGIC ----------------
  useEffect(() => {
    setClicks(0);
    setElapsedSeconds(0);
  }, [gameKey]);

  // ---------------- TIMER (UNCHANGED) ----------------
  useEffect(() => {
    if (!gameStarted || gameComplete) return;

    const id = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(id);
  }, [gameStarted, gameComplete, gameKey]);

  // ---------------- START FROM UI SELECTION ----------------
  const startChallenge = (c) => {
    setSelectedChallenge(c);
    setClicks(0);
    setElapsedSeconds(0);
  };

  const quitSelection = () => {
    setSelectedChallenge(null);
  };

  // ---------------- GAME EVENTS (UNCHANGED LOGIC) ----------------
  const handleStep = useCallback(({ from, to }) => {
    console.log("STEP:", from, "to", to);
    setClicks((prev) => prev + 1);
  }, []);

  const handleNavigate = useCallback((title) => {
    console.log("NAVIGATE:", title);
  }, []);

  const handleLoaded = useCallback(
    (title) => {
      console.log("LOADED:", title);

      const active = selectedChallenge || challenge;

      if (active && title === active.goal) {
        onGameComplete({ clicks, elapsedSeconds });
      }
    },
    [onGameComplete, selectedChallenge, challenge, clicks, elapsedSeconds]
  );

  // ---------------- LOADING ----------------
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        Loading challenges...
      </div>
    );
  }

  // ---------------- ERROR ----------------
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  // ---------------- CHALLENGE SELECT SCREEN (ADDED ONLY) ----------------
  if (!gameStarted && !selectedChallenge && !challenge) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <button
          onClick={quitSelection}
          className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-md"
        ></button>
        <div className="flex items-center gap-2 mb-6">
          <Play className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">
            Choose a Daily Challenge
          </h2>
        </div>

        <div className="grid gap-4 w-full max-w-md">
          {challenges.map((c, i) => (
            <button
              key={i}
              onClick={() => startChallenge(c)}
              className="p-4 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <span className="font-semibold text-gray-900">
                {c.start.replace(/_/g, " ")}
              </span>
              <span className="mx-2 text-gray-400">→</span>
              <span className="font-semibold text-gray-900">
                {c.end.replace(/_/g, " ")}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const activeChallenge = selectedChallenge || challenge;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px] p-6 flex flex-col">

      {/* ---------------- YOUR ORIGINAL STATS BAR (UNCHANGED) ---------------- */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              gameStarted && !gameComplete
                ? "bg-green-500 animate-pulse"
                : "bg-gray-300"
            }`}
          />
          <span className="text-sm font-medium text-gray-600">
            {gameStarted && !gameComplete
              ? "Live Challenge"
              : gameComplete
              ? "Challenge Over"
              : "Waiting to Start"}
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-xs text-gray-500 uppercase">Time</div>
              <div className="text-lg font-semibold tabular-nums">
                {formatTime(elapsedSeconds)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-xs text-gray-500 uppercase">Clicks</div>
              <div className="text-lg font-semibold tabular-nums">
                {clicks}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- VIEWER AREA (UNCHANGED STRUCTURE) ---------------- */}
      <div className="flex-1 bg-gray-50 rounded-lg border-2 border-gray-200 p-4 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {!gameStarted && !gameComplete ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Play className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700">
                  Ready to Play?
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Press <span className="font-medium text-green-600">Start</span>{" "}
                  to begin the challenge
                </p>
              </div>
            </div>
          ) : gameComplete ? (
            <CompletionScreen
              clicks={clicks}
              time={formatTime(elapsedSeconds)}
              onPlayAgain={onReset}
            />
          ) : activeChallenge ? (
            <WikiViewer
              key={gameKey}
              initialTitle={activeChallenge.start}
              onStep={handleStep}
              onNavigate={handleNavigate}
              onLoaded={handleLoaded}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}