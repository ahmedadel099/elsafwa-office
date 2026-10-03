import { useSyncExternalStore } from 'react';
import { store } from './engine';
import type { DatabaseState } from './types';

/** Subscribe a component to the demo database; re-renders after every committed change. */
export function useDb(): DatabaseState {
  return useSyncExternalStore(store.subscribe, store.getState);
}
