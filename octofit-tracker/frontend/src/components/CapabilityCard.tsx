import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type ResourceState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; items: T[] };

type Props<T> = {
  title: string;
  description: string;
  endpoint: string;
  itemsKey: string;
  emptyMessage: string;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, endpoint, itemsKey, emptyMessage, renderItem }: Props<T>) {
  const [resource, setResource] = useState<ResourceState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<Record<string, T[]>>(endpoint)
      .then((response) => {
        const items = response[itemsKey];
        if (!Array.isArray(items)) throw new Error('The server returned an invalid response');
        if (active) setResource({ status: 'success', items });
      })
      .catch((error: unknown) => {
        if (active) {
          setResource({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      });
    return () => {
      active = false;
    };
  }, [endpoint, itemsKey]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {resource.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {resource.status === 'error' && <p role="alert">Unable to load {title.toLowerCase()}: {resource.message}</p>}
        {resource.status === 'success' && resource.items.length === 0 && <p>{emptyMessage}</p>}
        {resource.status === 'success' && resource.items.length > 0 && (
          <ul className="list-group list-group-flush">
            {resource.items.map((item, index) => (
              <li className="list-group-item px-0" key={index}>{renderItem(item)}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
