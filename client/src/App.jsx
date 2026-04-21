import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { ChevronUp } from "lucide-react";
import Header from "./components/Header";
import Instructions from "./components/Instructions";
import GameLayout from "./components/GameLayout";
import ChallengeControls from "./components/ChallengeControls";
import { auth } from "./js/firebase";
import { connectSocket, disconnectSocket } from "./socket";

export default function App() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [challengeStats, setChallengeStats] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [user, authLoading] = useAuthState(auth);
  const activeChallenge = challenges[selectedChallenge];

  // fetch challenges from backend
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/challenges");
        const data = await res.json();
        const formatted = data.challenges.map((c, i) => ({
          id: i + 1,
          name: `Challenge ${i + 1}`,
          start: c.start,
          goal: c.end,
          startLabel: c.start.replace(/_/g, " "),
          goalLabel: c.end.replace(/_/g, " "),
        }));
        setChallenges(formatted);
        setChallengeStats(formatted.map(() => null));
      } catch (err) {
        console.error("Failed to load challenges:", err);
      }
    };
    fetchChallenges();
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      disconnectSocket();
      return;
    }

    let cancelled = false;
    let activeSocket = null;

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);
    const handleConnectError = (error) => {
      console.error("Socket connection failed:", error.message);
      setSocketConnected(false);
    };
    const handleLeaderboardUpdate = (entries) => {
      setLeaderboard(Array.isArray(entries) ? entries : []);
    };

    async function initRealtime() {
      try {
        const token = await user.getIdToken();
        if (cancelled) {
          return;
        }

        activeSocket = connectSocket(token);
        activeSocket.on("connect", handleConnect);
        activeSocket.on("disconnect", handleDisconnect);
        activeSocket.on("connect_error", handleConnectError);
        activeSocket.on("leaderboard:update", handleLeaderboardUpdate);

        setLeaderboard([]);
        setSocket(activeSocket);
        setSocketConnected(activeSocket.connected);
      } catch (error) {
        console.error("Failed to initialize realtime:", error);
        setSocket(null);
        setSocketConnected(false);
      }
    }

    initRealtime();

    return () => {
      cancelled = true;

      if (activeSocket) {
        activeSocket.off("connect", handleConnect);
        activeSocket.off("disconnect", handleDisconnect);
        activeSocket.off("connect_error", handleConnectError);
        activeSocket.off("leaderboard:update", handleLeaderboardUpdate);
      }

      disconnectSocket();
    };
  }, [user, authLoading]);

  function handleStart() {
    setGameStarted(true);
    setGameComplete(false);

    if (socket?.connected && activeChallenge) {
      socket.emit("game:start", {
        startPage: activeChallenge.start,
        targetPage: activeChallenge.goal,
      });
    }
  }

  function handleSelectChallenge(idx) {
    setSelectedChallenge(idx);
    setGameStarted(false);
    setGameComplete(false);
    setLeaderboard([]);
    setGameKey((k) => k + 1);
  }

  function handleGameComplete({ clicks, elapsedSeconds }) {
    setGameComplete(true);
    setChallengeStats((prev) => {
      const next = [...prev];
      next[selectedChallenge] = { clicks, elapsedSeconds };
      return next;
    });
  }

  function handleReset() {
    setGameStarted(false);
    setGameComplete(false);
    setGameKey((k) => k + 1);
  }

  // loading state
  if (challenges.length === 0) {
    return <div className="p-10 text-center">Loading challenges...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header onOpenInstructions={() => setShowInstructions(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <ChallengeControls
          challenges={challenges}
          challengeStats={challengeStats}
          selectedChallenge={selectedChallenge}
          gameStarted={gameStarted}
          gameComplete={gameComplete}
          onSelectChallenge={handleSelectChallenge}
          onStart={handleStart}
        />
        <GameLayout
          challenge={challenges[selectedChallenge]}
          challengeStats={challengeStats}
          leaderboard={leaderboard}
          user={user}
          authLoading={authLoading}
          socket={socket}
          socketConnected={socketConnected}
          gameStarted={gameStarted}
          gameComplete={gameComplete}
          gameKey={gameKey}
          onGameComplete={handleGameComplete}
          onReset={handleReset}
        />
      </main>

      {showInstructions && (
        <Instructions onClose={() => setShowInstructions(false)} />
      )}

      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-gray-900 text-white shadow-lg flex items-center justify-center hover:bg-gray-700 transition-colors z-50"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
