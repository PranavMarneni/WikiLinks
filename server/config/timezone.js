// Single source of truth for "midnight" — used to keep the daily challenge
// regeneration schedule and the per-day completion/leaderboard reset in sync.
// If they used different timezones, players could see stale challenge state
// desync from a fresh "day" boundary for several hours around midnight.
module.exports = "America/New_York";
