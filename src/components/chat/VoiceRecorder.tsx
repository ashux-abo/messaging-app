"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, Square, Send } from "lucide-react";

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob) => void;
  isDisabled?: boolean;
}

export function VoiceRecorder({ onSend, isDisabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const sendRecording = useCallback(() => {
    if (audioBlob) {
      onSend(audioBlob);
      // Reset state
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    }
  }, [audioBlob, onSend, audioUrl]);

  const cancelRecording = useCallback(() => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  }, [audioUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (audioBlob && audioUrl) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <audio src={audioUrl} controls className="flex-1" />
        <button
          onClick={sendRecording}
          disabled={isDisabled}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
        <button
          onClick={cancelRecording}
          className="p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isDisabled}
      className={`p-2 rounded-full transition-colors ${
        isRecording 
          ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse' 
          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isRecording ? (
        <div className="flex items-center gap-2">
          <Square className="w-4 h-4" />
          <span className="text-xs font-mono">{formatTime(recordingTime)}</span>
        </div>
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
}
