// hooks/useFileUpload.ts
import { useState, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Id } from '@/convex/_generated/dataModel';

export interface UploadResult {
    storageId: Id<"_storage">;
    url: string | null;
    filename: string;
    size: number;
    mimetype: string;
}

export interface UseFileUploadReturn {
    upload: (file: File) => Promise<UploadResult | null>;
    isUploading: boolean;
    progress: number;
    error: string | null;
    reset: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const generateUploadUrl = useMutation(api.files.generateUploadUrl);

    const upload = useCallback(async (file: File): Promise<UploadResult | null> => {
        setIsUploading(true);
        setProgress(0);
        setError(null);

        try {
            // Validate file on server first (optional)
            setProgress(10);

            // Step 1: Generate upload URL from Convex
            const uploadUrl = await generateUploadUrl();
            setProgress(30);

            // Step 2: Upload file directly to Convex storage
            const result = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            
            setProgress(80);

            if (!result.ok) {
                throw new Error("Upload to storage failed");
            }

            const { storageId } = await result.json();
            setProgress(100);

            toast.success('File uploaded successfully!');
            
            return {
                storageId,
                url: null, // URL will be generated dynamically when needed
                filename: file.name,
                size: file.size,
                mimetype: file.type,
            };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Upload failed';
            setError(errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setIsUploading(false);
        }
    }, [generateUploadUrl]);

    const reset = useCallback(() => {
        setProgress(0);
        setError(null);
        setIsUploading(false);
    }, []);

    return {
        upload,
        isUploading,
        progress,
        error,
        reset,
    };
}