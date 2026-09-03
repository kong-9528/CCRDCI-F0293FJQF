import { useEffect, useState } from "react";
import { subscribeRbac } from "@/lib/rbacStore";

/** 订阅 RBAC 内存 store，驱动列表页刷新 */
export function useRbacTick() {
  const [, setTick] = useState(0);
  useEffect(() => subscribeRbac(() => setTick((n) => n + 1)), []);
}
