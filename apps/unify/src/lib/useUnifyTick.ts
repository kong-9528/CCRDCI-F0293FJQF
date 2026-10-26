import { useEffect, useState } from "react";

type Listener = () => void;
const listeners = new Set<Listener>();

export function notifyUnify() {
  listeners.forEach((fn) => fn());
}

export function useUnifyTick() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const fn = () => setTick((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
}
