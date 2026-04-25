import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      const s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      });

      const bucketName = process.env.AWS_BUCKET_NAME || 'sahayak-uploads';

      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
        Body: buffer,
        ContentType: file.type || 'application/octet-stream',
      }));

      const filepath = `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${filename}`;
      return NextResponse.json({ success: true, filepath, message: 'File successfully uploaded to S3' });
    } else {
      const uploadDir = path.join(process.cwd(), 'uploads');
      try { await fs.mkdir(uploadDir, { recursive: true }); } catch (e) {}

      const filepath = path.join(uploadDir, filename);
      await fs.writeFile(filepath, buffer as any);
      
      return NextResponse.json({ success: true, filepath, message: 'File successfully uploaded locally' });
    }
  } catch (error: any) {
    console.error('Upload Agent Error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed: ' + error.message, details: error.stack }, { status: 500 });
  }
}

