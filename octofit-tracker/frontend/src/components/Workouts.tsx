import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';
import type { ResourceState } from './CapabilityCard.js';

type Workout = { title: string; focus: string; minutes: number; difficulty: string; reason: string };

export default function Workouts() {
  const [email, setEmail] = useState('mona@example.com');
  const [requestedEmail, setRequestedEmail] = useState('mona@example.com');
  const [state, setState] = useState<ResourceState<Workout>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<{ suggestions: Workout[] }>(`/api/workouts/suggestions/${encodeURIComponent(requestedEmail)}`)
      .then(({ suggestions }) => {
        if (active) setState({ status: 'success', items: suggestions });
      })
      .catch((error: unknown) => {
        if (active) setState({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
      });
    return () => { active = false; };
    }, [requestedEmail]);

  return (
      <>
        <form
          className="row g-2 align-items-end mb-3"
          onSubmit={(event) => {
            event.preventDefault();
            setState({ status: 'loading' });
            setRequestedEmail(email.trim());
          }}
        >
          <div className="col flex-grow-1">
            <label className="form-label" htmlFor="workout-user-email">User email</label>
            <input
              className="form-control"
              id="workout-user-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="col-auto">
            <button className="btn btn-primary" type="submit">Get suggestions</button>
          </div>
        </form>
        <CapabilityCard<Workout>
          title="Workout suggestions"
          description="Recommend workouts from activity patterns."
          state={state}
          emptyMessage="No workout suggestions available."
          renderItem={(workout) => <><strong>{workout.title}</strong> · {workout.focus} · {workout.minutes} min · {workout.difficulty}<p className="mb-0">{workout.reason}</p></>}
        />
      </>
  );
}
