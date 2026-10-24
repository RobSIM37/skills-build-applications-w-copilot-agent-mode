import { CapabilityCard } from './CapabilityCard.js';

type Workout = { title: string; focus: string; minutes: number; difficulty: string; reason: string };

export default function Workouts() {
  return (
    <CapabilityCard<Workout>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      endpoint={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`}
      itemsKey="suggestions"
      emptyMessage="No workout suggestions available."
      renderItem={(workout) => <><strong>{workout.title}</strong> · {workout.focus} · {workout.minutes} min · {workout.difficulty}<p className="mb-0">{workout.reason}</p></>}
    />
  );
}
