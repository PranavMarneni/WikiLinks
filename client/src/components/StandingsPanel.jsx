import React from "react";
import { Trophy, Medal } from "lucide-react";

export default function StandingsPanel() {
  // Mock data for demonstration
  const standings = [
    { rank: 1, name: "player_one", clicks: 3, time: "0:45" },
    { rank: 2, name: "wiki_master", clicks: 4, time: "1:12" },
    { rank: 3, name: "link_ninja", clicks: 4, time: "1:28" },
  ];

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Daily Leaderboard</h3>
        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
          Live
        </span>
      </div>

      <div className="space-y-2">
        {standings.length > 0 ? (
          standings.map((player) => (
            <div
              key={player.rank}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-6">
                  {getRankIcon(player.rank) || (
                    <span className="text-sm font-semibold text-gray-400">
                      {player.rank}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 truncate">
                  {player.name}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{player.clicks}</div>
                  <div className="text-xs">clicks</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold text-gray-900">{player.time}</div>
                  <div className="text-xs">time</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No standings yet</p>
            <p className="text-xs mt-1">Be the first to complete a challenge!</p>
          </div>
        )}
      </div>

      {/* Your rank section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-blue-900">—</span>
            <span className="text-sm font-medium text-blue-900">You</span>
          </div>
          <span className="text-xs text-blue-700">Not started</span>
        </div>
      </div>
    </div>
  );
}