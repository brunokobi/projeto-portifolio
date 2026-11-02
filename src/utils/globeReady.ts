import { useSyncExternalStore } from "react";

let ready = false;
const listeners = new Set<() => void>();

function setReady(value: boolean) {
  if (ready === value) return;
  ready = value;
  listeners.forEach((l) => l());
}

export const markGlobeReady = () => setReady(true);
export const resetGlobeReady = () => setReady(false);

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useGlobeReady(): boolean {
  return useSyncExternalStore(subscribe, () => ready);
}
