import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

export interface UploadOptions {
    maxSize?: number; // bytes
    allowedTypes?: string[];
    uploadDir?: string;
}

export interface UploadResult {
    filename: string;
    path: string;
    size: number;
    mimetype: string;
}

const DEFAULT_OPTIONS: UploadOptions = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    uploadDir: './uploads',
};

export async function uploadFile( 
    file: Buffer,
    originalFilename: string,
    mimetype: string,
    options: UploadOptions = {}
): Promise<UploadResult> {
    const config = { ...DEFAULT_OPTIONS, ...options };

    // Validate file size
    if (file.length > config.maxSize!) {
        throw new Error(`File size exceeds maximum of ${config.maxSize} bytes`);
    }

    // Validate file type
    if (!config.allowedTypes!.includes(mimetype)) {
        throw new Error(`File type ${mimetype} not allowed`);
    }

    // Create upload directory
    await mkdir(config.uploadDir!, { recursive: true });

    // Generate unique filename
    const ext = originalFilename.split('.').pop();
    const filename = `${randomBytes(16).toString('hex')}.${ext}`;
    const filepath = join(config.uploadDir!, filename);

    // Write file
    await writeFile(filepath, file);

    return {
        filename,
        path: filepath,
        size: file.length,
        mimetype,
    };
}