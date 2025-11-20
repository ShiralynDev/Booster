"use client";

import { useEffect } from "react";
import { trpc } from "@/trpc/client";

export default function UnreadTitleUpdater() {
  const { data: count } = trpc.notifications.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30_000, // refresh every 30s
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const base = document.title.replace(/^\(\d+\)\s*/, "");
    if (typeof count === "number" && count > 0) {
      document.title = `(${count}) ${base}`;
    } else {
      document.title = base;
    }
  }, [count]);

  return null;
}
