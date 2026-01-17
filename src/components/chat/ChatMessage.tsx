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
  onMessageEdit?: (messageId: Id<"messages">, newContent: string) => void;
}

export function ChatMessage({ message, currentUserId, onReply, onMessageEdit }: ChatMessageProps) {
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
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [messageContent, setMessageContent] = useState(message.content);

  const renderMessageContent = () => {
    switch (message.type) {
      case "image":
        return (
          <div className="space-y-2">
            {messageContent && !messageContent.includes('/uploads/') && (
              <p className="break-words">{messageContent}</p>
            )}
            {displayUrl && (
              <img
                src={displayUrl}
                alt="Shared image"
                className="max-w-xs md:max-w-sm rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(displayUrl, "_blank")}
              />
            )}
          </div>
        );

      case "file":
        return (
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl min-w-[200px]">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <FileIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{messageContent}</p>
              {displayUrl && (
                <a
                  href={displayUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-1"
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
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl min-w-[200px]">
            <div className="w-10 h-10 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <span className="text-lg">🎤</span>
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
        return <p className="break-words">{messageContent}</p>;
    }
  };

  return (
    <div
      className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : "flex-row"} group relative`}
      onMouseEnter={() => {
        setShowReplyButton(true);
        if (hoverTimeout) clearTimeout(hoverTimeout);
      }}
      onMouseLeave={() => {
        const timeout = setTimeout(() => {
          setShowReplyButton(false);
          setShowReactionPicker(false);
          setShowMessageActions(false);
        }, 150);
        setHoverTimeout(timeout);
      }}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 shrink-0 ring-2 ring-emerald-100 dark:ring-emerald-900/30">
          <AvatarImage src={sender?.imageUrl} />
          <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium">
            {sender?.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isCurrentUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {!isCurrentUser && (
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5 px-1">
            {sender?.name}
          </p>
        )}

        {/* Replied To Message Preview */}
        {originalMessage && originalSender && (
          <div className={`text-xs px-3 py-2 rounded-lg border-l-4 ${
            isCurrentUser 
              ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-800 dark:text-emerald-200" 
              : "bg-gray-50 dark:bg-gray-800 border-emerald-400 text-gray-700 dark:text-gray-300"
          }`}>
            <p className="font-semibold mb-0.5">{originalSender.name}</p>
            <p className="truncate opacity-80">
              {originalMessage.type === "image" && "📷 Image"}
              {originalMessage.type === "file" && "📎 File"}
              {originalMessage.type === "voice" && "🎤 Voice Message"}
              {originalMessage.type === "text" && originalMessage.content}
            </p>
          </div>
        )}

        <div className="relative">
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm md:text-base shadow-sm ${
              isCurrentUser
                ? "bg-emerald-600 text-white rounded-br-md hover:bg-emerald-700 transition-colors"
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-700"
            }`}
          >
            {renderMessageContent()}
            
            {message.isEdited && (
              <p className="text-xs opacity-60 mt-1 italic">(edited)</p>
            )}
          </div>

          {/* Action Buttons - Positioned outside message bubble */}
          {showReplyButton && (
            <div className={`absolute top-0 flex gap-1 ${
              isCurrentUser ? "right-full pr-2" : "left-full pl-2"
            }`}>
              <button
                onClick={() => setShowReactionPicker(!showReactionPicker)}
                className="p-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition shadow-sm"
                title="Add reaction"
              >
                <Smile className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowMessageActions(!showMessageActions)}
                className="p-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition shadow-sm"
                title="More actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {onReply && (
                <button
                  onClick={() => onReply(message._id)}
                  className="p-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition shadow-sm"
                  title="Reply"
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
              messageContent={messageContent}
              onClose={() => setShowMessageActions(false)}
              onEdit={(newContent) => {
                setMessageContent(newContent);
                if (onMessageEdit) {
                  onMessageEdit(message._id, newContent);
                }
              }}
            />
          )}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-500 px-1">
          {formatDistanceToNow(new Date(message.timestamp), {
            addSuffix: true,
          })}
        </p>

        {message.reactions.length > 0 && (
          <div className="flex gap-1.5 mt-1 flex-wrap px-1">
            {message.reactions.map((reaction: any, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full text-xs border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                {reaction.emoji}
                {reaction.emoji === "👍" &&
                  message.reactions.filter((r: any) => r.emoji === "👍").length > 1 && (
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
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