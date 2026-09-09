import { useSyncExternalStore } from "react";
import { subscribeUcStore, listUsers } from "@/lib/ucUserStore";

export function useUcTick() {
  return useSyncExternalStore(
    subscribeUcStore,
    () => listUsers().map((u) => `${u.id}:${u.status}`).join("|"),
    () => "",
  );
}
