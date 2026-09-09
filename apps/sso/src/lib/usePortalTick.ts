import { useSyncExternalStore } from "react";
import { listPortalUsers, subscribePortalUsers } from "@/lib/portalUserStore";

/** 订阅门户用户 store，驱动列表/详情刷新 */
export function usePortalTick() {
  return useSyncExternalStore(
    subscribePortalUsers,
    () => listPortalUsers().map((u) => `${u.id}:${u.status}`).join("|"),
    () => "",
  );
}
