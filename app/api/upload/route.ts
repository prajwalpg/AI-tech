import { NextResponse } from 'next/server';
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

    // Save to /public/uploads so it's accessible or root /uploads depending on need
    // For local dev, a root level 'uploads' directory:
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    try { await fs.mkdir(uploadDir, { recursive: true }); } catch (e) {}

    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, buffer);

    // We'll return the string path
    return NextResponse.json({ success: true, filepath, message: 'File successfully uploaded' });

  } catch (error: any) {
    console.error('Upload Agent Error:', error);
    return NextResponse.json({ success: false, error: 'File upload failed' }, { status: 500 });
  }
}
