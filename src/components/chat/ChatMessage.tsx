"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { MessageCircle, FileIcon, Download, Smile, MoreHorizontal } from "lucide-react";
import { ReactionPicker } from "./ReactionPicker";
import { MessageActions } from "./MessageActions";

interface ChatMessageProps {
  message: Doc<"messages">;
  currentUserId: Id<"users">;
  onReply?: (messageId: Id<"messages">) => void;
}

export function ChatMessage({ message, currentUserId, onReply }: ChatMessageProps) {
  const sender = useQuery(api.users.getUserById, {
    userId: message.senderId,
  });

  const originalMessage = useQuery(
    api.messages.getMessageById,
    message.repliedToMessageId ? { messageId: message.repliedToMessageId } : "skip"
  );

  const originalSender = useQuery(
    api.users.getUserById,
    originalMessage?.senderId ? { userId: originalMessage.senderId } : "skip"
  );

  const fileUrl = useQuery(
    api.files.getFileUrl,
    message.storageId ? { storageId: message.storageId } : "skip"
  );

  // Handle legacy fileUrl for backward compatibility
  const displayUrl = fileUrl || message.fileUrl;

  const isCurrentUser = message.senderId === currentUserId;
  const [showReplyButton, setShowReplyButton] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMessageActions, setShowMessageActions] = useState(false);

  const renderMessageContent = () => {
    switch (message.type) {
      case "image":
        return (
          <div className="space-y-2">
            {message.content && !message.content.includes('/uploads/') && (
              <p className="break-words">{message.content}</p>
            )}
            {displayUrl && (
              <img
                src={displayUrl}
                alt="Shared image"
                className="max-w-xs md:max-w-sm rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(displayUrl, "_blank")}
              />
            )}
          </div>
        );

      case "file":
        return (
          <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg min-w-[200px]">
            <FileIcon className="w-8 h-8 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.content}</p>
              {displayUrl && (
                <a
                  href={displayUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs hover:underline flex items-center gap-1 mt-1 opacity-80"
                >
                  <Download className="w-3 h-3" />
                  Download
                </a>
              )}
            </div>
          </div>
        );

      case "voice":
        return (
          <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg min-w-[200px]">
            <div className="w-8 h-8 flex items-center justify-center bg-blue-500/20 rounded-full">
              <span className="text-sm">🎤</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Voice Message</p>
              {displayUrl && (
                <audio controls className="w-full mt-2">
                  <source src={displayUrl} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </div>
          </div>
        );

      default:
        return <p className="break-words">{message.content}</p>;
    }
  };

  return (
    <div
      className={`flex gap-2 md:gap-3 ${isCurrentUser ? "flex-row-reverse" : "flex-row"} group`}
      onMouseEnter={() => setShowReplyButton(true)}
      onMouseLeave={() => setShowReplyButton(false)}
    >
      {!isCurrentUser && (
        <Avatar className="h-6 w-6 md:h-8 md:w-8 shrink-0">
          <AvatarImage src={sender?.imageUrl} />
          <AvatarFallback>{sender?.name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isCurrentUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {!isCurrentUser && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            {sender?.name}
          </p>
        )}

        {/* Replied To Message Preview */}
        {originalMessage && originalSender && (
          <div className={`text-xs px-2 py-1 rounded border-l-2 ${
            isCurrentUser 
              ? "bg-blue-500/20 border-blue-400 text-blue-100" 
              : "bg-gray-200 dark:bg-gray-600 border-gray-400 dark:border-gray-500 text-gray-700 dark:text-gray-300"
          }`}>
            <p className="font-medium">{originalSender.name}</p>
            <p className="truncate opacity-90">
              {originalMessage.type === "image" && "📷 Image"}
              {originalMessage.type === "file" && "📎 File"}
              {originalMessage.type === "voice" && "🎤 Voice Message"}
              {originalMessage.type === "text" && originalMessage.content}
            </p>
          </div>
        )}

        <div
          className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base relative ${
            isCurrentUser
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none"
          }`}
        >
          {renderMessageContent()}
          
          {message.isEdited && (
            <p className="text-xs opacity-70 mt-1">(edited)</p>
          )}

          {/* Action Buttons */}
          {showReplyButton && (
            <div className={`absolute top-1/2 -translate-y-1/2 flex gap-1 ${
              isCurrentUser ? "-right-20" : "-left-20"
            }`}>
              <button
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                className={`p-1 rounded-full transition ${
                  isCurrentUser
                    ? "hover:bg-blue-700 text-white"
                    : "hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400"
                }`}
              >
                <Smile className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowMessageActions(!showMessageActions)}
                className={`p-1 rounded-full transition ${
                  isCurrentUser
                    ? "hover:bg-blue-700 text-white"
                    : "hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400"
                }`}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {onReply && (
                <button
                  onClick={() => onReply(message._id)}
                  className={`p-1 rounded-full transition ${
                    isCurrentUser
                      ? "hover:bg-blue-700 text-white"
                      : "hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Reaction Picker */}
          {showReactionPicker && (
            <ReactionPicker
              messageId={message._id}
              currentUserId={currentUserId}
              isCurrentUser={isCurrentUser}
              onClose={() => setShowReactionPicker(false)}
            />
          )}

          {/* Message Actions */}
          {showMessageActions && (
            <MessageActions
              messageId={message._id}
              currentUserId={currentUserId}
              messageSenderId={message.senderId}
              onClose={() => setShowMessageActions(false)}
            />
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