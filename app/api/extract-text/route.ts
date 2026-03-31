import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

/**
 * PDF Text Extraction using Gemini 2.5 (Fastest and most accurate for educators)
 */
export async function POST(req: NextRequest) {
  try {
    const { filepath } = await req.json();

    if (!filepath || !fs.existsSync(filepath)) {
      return NextResponse.json({ error: 'File not found on server' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
    
    // We ask Gemini to extract and summarize the text for the Knowledge Base
    const result = await model.generateContent([
      "Extract and provide a comprehensive summary of all educational content in this textbook chapter. Organize it with clear headings and bullet points suitable for a teacher's knowledge base.",
      {
        inlineData: {
          data: fs.readFileSync(filepath).toString("base64"),
          mimeType: "application/pdf"
        }
      }
    ]);

    const extractedText = result.response.text();
    
    return NextResponse.json({ success: true, text: extractedText });
  } catch (error: any) {
    console.error('Extraction Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
