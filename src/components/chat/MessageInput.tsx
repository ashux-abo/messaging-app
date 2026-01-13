"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  conversationId: Id<"conversations">;
  currentUserId: Id<"users">;
  recipientId?: Id<"users">; // Optional for 1-on-1 message restriction check
}

export function MessageInput({
  conversationId,
  currentUserId,
  recipientId,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendMessage = useMutation(api.messages.sendMessage);
  const setTyping = useMutation(api.typing.setTyping);
  const clearTyping = useMutation(api.typing.clearTyping);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      await sendMessage({
        conversationId,
        senderId: currentUserId,
        recipientId, // Pass recipient for friendship check
        content: content.trim(),
        type: "text",
      });
      setContent("");
      await clearTyping({
        conversationId,
        userId: currentUserId,
      });
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);

    // Set typing indicator
    await setTyping({
      conversationId,
      userId: currentUserId,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to clear typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(async () => {
      await clearTyping({
        conversationId,
        userId: currentUserId,
      });
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex gap-3">
        <Button
          variant="ghost"
          size="icon"
          disabled={isLoading}
          className="shrink-0"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        <Input
          placeholder="Type a message..."
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="flex-1 bg-gray-100 dark:bg-gray-800 border-0 rounded-full"
        />

        <Button
          onClick={handleSend}
          disabled={!content.trim() || isLoading}
          className="shrink-0 bg-blue-600 hover:bg-blue-700"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
