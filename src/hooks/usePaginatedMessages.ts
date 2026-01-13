"use client";

import { useState, useCallback } from "react";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export function usePaginatedMessages(conversationId: Id<"conversations">) {
  const [cursor, setCursor] = useState<number | null>(null);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const convex = useConvex();

  const loadMore = useCallback(async () => {
    try {
      const result = await convex.query(api.messages.getMessagesPaginated, {
        conversationId,
        limit: 20,
        cursor: cursor || undefined,
      });

      setAllMessages((prev) => [...result.messages, ...prev]);
      setCursor(result.nextCursor);
      setHasMore(!!result.nextCursor);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  }, [cursor, conversationId, convex]);

  return { allMessages, hasMore, loadMore, cursor };
}