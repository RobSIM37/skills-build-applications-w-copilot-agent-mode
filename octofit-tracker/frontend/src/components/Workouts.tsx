import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';
import type { ResourceState } from './CapabilityCard.js';

type Workout = { title: string; focus: string; minutes: number; difficulty: string; reason: string };

export default function Workouts() {
  const [state, setState] = useState<ResourceState<Workout>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<{ suggestions: Workout[] }>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`)
      .then(({ suggestions }) => {
        if (active) setState({ status: 'success', items: suggestions });
      })
      .catch((error: unknown) => {
        if (active) setState({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard<Workout>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      state={state}
      emptyMessage="No workout suggestions available."
      renderItem={(workout) => <><strong>{workout.title}</strong> · {workout.focus} · {workout.minutes} min · {workout.difficulty}<p className="mb-0">{workout.reason}</p></>}
    />
  );
}
