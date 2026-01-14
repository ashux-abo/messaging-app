export type FileType = 'image' | 'document' | 'audio' | 'video' | 'unknown';

export interface FileInfo {
    name: string;
    size: number;
    type: string;
    category: FileType;
    url?: string;
}

export const FILE_CATEGORIES = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    document: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
    ],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac'],
    video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
};

export const getFileCategory = (mimeType: string): FileType => {
    for (const [category, types] of Object.entries(FILE_CATEGORIES)) {
        if (types.includes(mimeType)) {
            return category as FileType;
        }
    }
    return 'unknown';
};

export const isAllowedFileType = (
    mimeType: string,
    allowedTypes: string[] = []
): boolean => {
    if (allowedTypes.length === 0) {
        return Object.values(FILE_CATEGORIES)
            .flat()
            .includes(mimeType);
    }
    return allowedTypes.includes(mimeType);
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

export const getFileName = (filename: string): string => {
    return filename.substring(0, filename.lastIndexOf('.')) || filename;
};

export const validateFile = (
    file: File,
    options: {
        maxSize?: number;
        allowedTypes?: string[];
    } = {}
): { valid: boolean; error?: string } => {
    const { maxSize = 10 * 1024 * 1024, allowedTypes = [] } = options;

    if (file.size > maxSize) {
        return {
            valid: false,
            error: `File size exceeds ${formatFileSize(maxSize)} limit`,
        };
    }

    if (!isAllowedFileType(file.type, allowedTypes)) {
        return {
            valid: false,
            error: `File type ${file.type} not allowed`,
        };
    }

    return { valid: true };
};

export const createFileInfo = (file: File, url?: string): FileInfo => {
    return {
        name: file.name,
        size: file.size,
        type: file.type,
        category: getFileCategory(file.type),
        url,
    };
};
