import { Timer, MousePointer, Play, CalendarCheck } from "lucide-react";
import WikiViewer from "../WikiViewer";
import React, { useState, useEffect, useCallback, useRef } from "react";
import CompletionScreen from "./CompletionScreen";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function WikiContainer({
  challenge,
  allChallengesComplete,
  gameStarted,
  gameComplete,
  gameKey,
  socket,
  socketConnected,
  onGameComplete,
  onReset
}) {
  const [clicks, setClicks] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const clicksRef = useRef(0);
  const elapsedRef = useRef(0);

  useEffect(() => {
    setClicks(0);
    setElapsedSeconds(0);
    clicksRef.current = 0;
    elapsedRef.current = 0;
  }, [gameKey]);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameComplete) return;

    const id = setInterval(() => {
      setElapsedSeconds((s) => {
        elapsedRef.current = s + 1;
        return s + 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [gameStarted, gameComplete, gameKey]);

  const handleStep = useCallback(({ from, to }) => {
    console.log("STEP:", from, "to", to);
    setClicks((prev) => {
      clicksRef.current = prev + 1;
      return prev + 1;
    });

    if (socketConnected && socket) {
      socket.emit("game:click", { newPage: to });
    }
  }, [socket, socketConnected]);

  const handleNavigate = useCallback((title) => {
    console.log("NAVIGATE:", title);
  }, []);

  const handleLoaded = useCallback(
    (title) => {
      console.log("LOADED:", title);

      if (challenge && title.replace(/ /g, "_").toLowerCase() === challenge.goal.toLowerCase()) {
        const finalClicks = clicksRef.current;
        const finalElapsed = elapsedRef.current;

        if (socketConnected && socket) {
          socket.emit("game:player-finished", { elapsedSeconds: finalElapsed });
        }

        onGameComplete({ clicks: finalClicks, elapsedSeconds: finalElapsed });
      }
    },
    [onGameComplete, challenge, socket, socketConnected]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px] max-h-[500px] p-6 flex flex-col">

      {/* Header */}
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

      {/* Game Area */}
      <div className="flex-1 min-h-0 bg-gray-50 rounded-lg border-2 border-gray-200 p-4 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto">
          {allChallengesComplete && !gameStarted && !gameComplete ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CalendarCheck className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700">
                  You have completed your challenges for today
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Come back tomorrow for a new set of challenges
                </p>
              </div>
            </div>
          ) : !gameStarted && !gameComplete ? (
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
          ) : challenge ? (
            <WikiViewer
              key={gameKey}
              initialTitle={challenge.start}
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
