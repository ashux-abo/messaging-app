"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, X, FileIcon } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { ReplyPreview } from "./ReplyPreview";
import { useFileUpload } from "@/hooks/useFileUpload";
import { VoiceRecorder } from "./VoiceRecorder";

interface MessageInputProps {
  conversationId: Id<"conversations">;
  currentUserId: Id<"users">;
  recipientId?: Id<"users">;
  replyingTo?: Id<"messages"> | null;
  onClearReply?: () => void;
}

export function MessageInput({
  conversationId,
  currentUserId,
  recipientId,
  replyingTo,
  onClearReply,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [replyingToLocal, setReplyingToLocal] = useState<Id<"messages"> | null>(replyingTo || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendMessage = useMutation(api.messages.sendMessage);
  const setTyping = useMutation(api.typing.setTyping);
  const clearTyping = useMutation(api.typing.clearTyping);
  const { toast } = useToast();
  const { upload, isUploading, progress } = useFileUpload();

  useEffect(() => {
    setReplyingToLocal(replyingTo || null);
  }, [replyingTo]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!content.trim() && !selectedFile) return;

    setIsLoading(true);
    try {
      let storageId: Id<"_storage"> | undefined;
      let messageType: "text" | "image" | "file" | "voice" = "text";

      // Upload file if present
      if (selectedFile) {
        const uploadResult = await upload(selectedFile);
        if (!uploadResult) {
          throw new Error("File upload failed");
        }
        
        storageId = uploadResult.storageId;
        
        // Determine message type
        if (selectedFile.type.startsWith('image/')) {
          messageType = "image";
        } else {
          messageType = "file";
        }
      }

      // Send message with storageId instead of fileUrl
      await sendMessage({
        conversationId,
        senderId: currentUserId,
        recipientId,
        content: content.trim() || selectedFile?.name || '',
        type: messageType,
        storageId, // Use storageId
        repliedToMessageId: replyingToLocal || undefined,
      });

      // Reset form
      setContent("");
      setSelectedFile(null);
      setFilePreview(null);
      setReplyingToLocal(null);
      onClearReply?.();
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      await clearTyping({
        conversationId,
        userId: currentUserId,
      });
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceSend = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      // Convert Blob to File for upload
      const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, {
        type: 'audio/webm',
      });
      
      // Upload voice file
      const uploadResult = await upload(audioFile);
      if (!uploadResult) {
        throw new Error("Voice upload failed");
      }

      // Send voice message
      await sendMessage({
        conversationId,
        senderId: currentUserId,
        recipientId,
        content: "Voice Message",
        type: "voice",
        storageId: uploadResult.storageId,
        repliedToMessageId: replyingToLocal || undefined,
      });

      // Reset reply state
      setReplyingToLocal(null);
      onClearReply?.();

      await clearTyping({
        conversationId,
        userId: currentUserId,
      });
    } catch (error: any) {
      console.error("Failed to send voice message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send voice message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);

    await setTyping({
      conversationId,
      userId: currentUserId,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

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

  const isDisabled = isLoading || isUploading;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {replyingToLocal && (
        <div className="p-2 md:p-3 border-b border-gray-200 dark:border-gray-700">
          <ReplyPreview 
            repliedToMessageId={replyingToLocal}
            onRemoveReply={() => {
              setReplyingToLocal(null);
              onClearReply?.();
            }}
          />
        </div>
      )}

      {/* File Preview */}
      {selectedFile && (
        <div className="p-2 md:p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {filePreview ? (
              <img 
                src={filePreview} 
                alt="Preview" 
                className="w-16 h-16 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-16 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded">
                <FileIcon className="w-8 h-8 text-gray-500" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              disabled={isDisabled}
              className="shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {isUploading && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                Uploading... {progress}%
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="p-2 md:p-4">
        <div className="flex gap-2 md:gap-3">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="ghost"
            size="icon"
            disabled={isDisabled}
            className="shrink-0 h-8 w-8 md:h-10 md:w-10"
          >
            <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
          </Button>

          <Input
            placeholder="Type a message..."
            value={content}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            className="flex-1 bg-gray-100 dark:bg-gray-800 border-0 rounded-full text-sm md:text-base"
          />

          <VoiceRecorder
            onSend={handleVoiceSend}
            isDisabled={isDisabled}
          />

          <Button
            onClick={handleSend}
            disabled={(!content.trim() && !selectedFile) || isDisabled}
            className="shrink-0 h-8 w-8 md:h-10 md:w-10 bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}