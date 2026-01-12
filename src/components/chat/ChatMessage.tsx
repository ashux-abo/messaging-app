"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface ChatMessageProps {
  message: Doc<"messages">;
  currentUserId: string;
}

export function ChatMessage({ message, currentUserId }: ChatMessageProps) {
  const sender = useQuery(api.users.getUserById, {
    userId: message.senderId,
  });

  const isCurrentUser = message.senderId === currentUserId;

  return (
    <div
      className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : "flex-row"} mb-4`}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={sender?.imageUrl} />
          <AvatarFallback>{sender?.name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-xs ${isCurrentUser ? "items-end" : "items-start"} flex flex-col`}>
        {!isCurrentUser && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            {sender?.name}
          </p>
        )}

        <div
          className={`px-4 py-2 rounded-lg ${
            isCurrentUser
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none"
          }`}
        >
          {message.type === "text" && <p className="text-sm">{message.content}</p>}
          {message.type === "image" && (
            <img
              src={message.content}
              alt="Shared image"
              className="max-w-sm rounded"
            />
          )}
          {message.isEdited && (
            <p className="text-xs opacity-70 mt-1">(edited)</p>
          )}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formatDistanceToNow(new Date(message.timestamp), {
            addSuffix: true,
          })}
        </p>

        {message.reactions.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {message.reactions.map((reaction: any, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs"
              >
                {reaction.emoji}
                {reaction.emoji === "👍" &&
                  message.reactions.filter((r: any) => r.emoji === "👍").length > 1 && (
                    <span>
                      {
                        message.reactions.filter((r: any) => r.emoji === "👍")
                          .length
                      }
                    </span>
                  )}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
