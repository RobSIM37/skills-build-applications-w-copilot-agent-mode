import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';
import type { ResourceState } from './CapabilityCard.js';

type Team = { name: string; mascot?: string; members: string[] };

export default function Teams() {
  const [state, setState] = useState<ResourceState<Team>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<{ teams: Team[] }>('/api/teams')
      .then(({ teams }) => {
        if (active) setState({ status: 'success', items: teams });
      })
      .catch((error: unknown) => {
        if (active) setState({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
      });
    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard<Team>
      title="Teams"
      description="Manage teams and members."
      state={state}
      emptyMessage="No teams yet."
      renderItem={(team) => <><strong>{team.name}</strong>{team.mascot ? ` · ${team.mascot}` : ''} · {team.members.length} members</>}
    />
  );
}
