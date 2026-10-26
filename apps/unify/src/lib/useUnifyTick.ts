import { useEffect, useState } from "react";

type Listener = () => void;
const listeners = new Set<Listener>();

export function notifyUnify() {
  listeners.forEach((fn) => fn());
}

/** 订阅名单/审核等本地 store 变更；返回值需放入列表 useMemo 依赖 */
export function useUnifyTick() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const fn = () => setTick((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return tick;
}
