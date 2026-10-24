import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';
import type { ResourceState } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number; occurredAt?: string };

export default function Activities() {
  const [state, setState] = useState<ResourceState<Activity>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<{ activities: Activity[] }>('/api/activities')
      .then(({ activities }) => {
        if (active) setState({ status: 'success', items: activities });
      })
      .catch((error: unknown) => {
        if (active) setState({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard<Activity>
      title="Activities"
      description="Track student activity minutes and points."
      state={state}
      emptyMessage="No activities yet."
      renderItem={(activity) => <><strong>{activity.type}</strong> · {activity.minutes} minutes · {activity.points} points</>}
    />
  );
}
