// app/api/upload/route.ts
import { NextResponse, NextRequest } from 'next/server';

export const POST = async (request: NextRequest) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' }, 
                { status: 400 }
            );
        }

        // Validate file size (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size exceeds 10MB limit' }, 
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: `File type ${file.type} not allowed` }, 
                { status: 400 }
            );
        }

        // Return file data for client-side Convex upload
        return NextResponse.json({
            success: true,
            data: {
                name: file.name,
                type: file.type,
                size: file.size,
                validated: true
            }
        }, { status: 200 });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: errorMessage }, 
            { status: 400 }
        );
    }
}