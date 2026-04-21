import { Trophy, Medal } from "lucide-react";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function StandingsPanel({
  challengeStats,
  leaderboard,
  user,
  authLoading,
  socketConnected,
}) {
  const yourRank = user
    ? leaderboard.findIndex((player) => player.userId === user.uid) + 1
    : 0;
  const yourLiveEntry = user
    ? leaderboard.find((player) => player.userId === user.uid)
    : null;
  const completed = challengeStats.filter(Boolean);
  const totalClicks = completed.reduce((sum, stats) => sum + stats.clicks, 0);
  const totalSeconds = completed.reduce((sum, stats) => sum + stats.elapsedSeconds, 0);
  const hasLocalStats = completed.length > 0;

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
    return null;
  };

  const emptyStateMessage = authLoading
    ? "Loading account..."
    : !user
    ? "Log in to join the live leaderboard."
    : !socketConnected
    ? "Realtime standings are unavailable until the socket server connects."
    : "No standings yet. Start a challenge to seed the board.";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col max-h-[500px]">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Daily Leaderboard</h3>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            socketConnected
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {socketConnected ? "Live" : "Offline"}
        </span>
      </div>

      <div className="space-y-2 overflow-y-auto flex-1">
        {leaderboard.length > 0 ? (
          leaderboard.map((player, index) => (
            <div
              key={player.userId}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-6">
                  {getRankIcon(index + 1) || (
                    <span className="text-sm font-semibold text-gray-400">
                      {index + 1}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 truncate">
                  {player.displayName || player.userId.slice(-6)}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{player.clicks}</div>
                  <div className="text-xs">clicks</div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-semibold ${
                      player.completed ? "text-green-600" : "text-amber-600"
                    }`}
                  >
                    {player.completed ? "Done" : "Playing"}
                  </div>
                  <div className="text-xs">status</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{emptyStateMessage}</p>
            <p className="text-xs mt-1">Be the first to complete a challenge!</p>
          </div>
        )}
      </div>

      {/* Your rank section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-blue-900">
              {yourRank > 0 ? `#${yourRank}` : "—"}
            </span>
            <span className="text-sm font-medium text-blue-900">You</span>
          </div>
          {yourLiveEntry ? (
            <div className="flex items-center gap-4 text-xs text-blue-700">
              <div className="text-right">
                <div className="font-semibold text-blue-900">{yourLiveEntry.clicks}</div>
                <div>clicks</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-blue-900">
                  {yourLiveEntry.completed ? "Done" : "Playing"}
                </div>
                <div>status</div>
              </div>
            </div>
          ) : hasLocalStats ? (
            <div className="flex items-center gap-4 text-xs text-blue-700">
              <div className="text-right">
                <div className="font-semibold text-blue-900">{totalClicks}</div>
                <div>clicks</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-semibold text-blue-900">
                  {formatTime(totalSeconds)}
                </div>
                <div>time</div>
              </div>
            </div>
          ) : (
            <span className="text-xs text-blue-700">Not started</span>
          )}
        </div>
      </div>
    </div>
  );
}