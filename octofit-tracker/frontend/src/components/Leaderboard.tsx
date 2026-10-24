import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  return (
    <CapabilityCard<LeaderboardEntry>
      title="Leaderboard"
      description="Compare team point totals."
      endpoint="/api/leaderboard"
      itemsKey="leaderboard"
      emptyMessage="No leaderboard scores yet."
      renderItem={(entry) => <><strong>#{entry.rank} {entry.teamName}</strong> · {entry.totalPoints} points</>}
    />
  );
}
