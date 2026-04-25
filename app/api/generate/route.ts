import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Initialize Gemini SDK securely via environment variable
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Critical: GEMINI_API_KEY is missing in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

const generateSchema = z.object({
  topic: z.string().min(1).max(500),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questionType: z.enum(['MCQ', 'Short', 'Descriptive']),
  quantity: z.number().int().min(1).max(20).optional(),
  filepath: z.string().optional()
});

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in environment variables");
    }

    const body = await req.json();
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { topic, difficulty, questionType, quantity, filepath } = parsed.data;

    console.log("Incoming request:", { topic, difficulty, questionType, quantity, filepath });

    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-lite-latest",
      generationConfig: { responseMimeType: "application/json" }
    });

    // We build a multi-modal prompt if a PDF is provided
    const promptText = `You are a strict Question Generator Agent for an AI Teaching application.
Target Topic: ${topic}
Difficulty: ${difficulty}
Format Type: ${questionType} (e.g. MCQ, Short, Descriptive)
Number of Questions requested: ${quantity || 5}

CRITICAL INSTRUCTIONS:
1. You MUST generate questions STRICTLY and EXCLUSIVELY based on the provided Textbook Context.
2. DO NOT include any out-of-syllabus questions. DO NOT use outside knowledge. 
3. If the provided context does not contain enough information for the requested topic, DO NOT invent or make up facts. Only use the provided text.
4. Generate EXACTLY ${quantity || 5} questions based on this text.

Analyze the provided context and generate a beautifully formatted json output question paper.
Your output MUST be a valid JSON Object with a "questions" array.
Structure for EACH question:
{
  "id": number,
  "questionText": "What is ...?",
  "options": ["A", "B", "C", "D"], // Only if MCQ, else null
  "correctAnswer": "A",
  "marks": number
}

Output ONLY valid JSON starting with { "questions": [...] }.`;

    const contents: any[] = [promptText];

    if (filepath) {
      try {
        let fileBuffer;
        if (filepath.startsWith('http')) {
          const response = await fetch(filepath);
          if (!response.ok) {
            throw new Error("Failed to fetch file from remote source");
          }
          fileBuffer = await response.arrayBuffer();
        } else {
          const fs = require('fs');
          fileBuffer = fs.readFileSync(filepath);
        }
        
        if (filepath.toLowerCase().includes('.pdf')) {
          console.log(`Using Native Gemini PDF processing for: ${filepath}`);
          contents.push({
            inlineData: {
              data: Buffer.from(fileBuffer).toString("base64"),
              mimeType: "application/pdf"
            }
          });
        } else {
          // For non-PDF files, we read text
          const textContent = Buffer.from(fileBuffer).toString('utf-8');
          contents.push(`Additional Context: textbook Context Uploaded: ${textContent.substring(0, 50000)}`);
        }
      } catch (err) {
        console.error("Failed to process file URL:", err);
         return NextResponse.json({ success: false, error: "Failed to process remote file" }, { status: 400 });
      }
    } else {
      contents.push("Generate based on general syllabus standards since no specific textbook was uploaded.");
    }

    const result = await model.generateContent(contents);
    const responseText = result.response.text();

    console.log("Gemini response received");

    let jsonParsed;
    try {
      const start = responseText.indexOf('{');
      const end = responseText.lastIndexOf('}');
      const jsonContent = responseText.substring(start, end + 1);
      jsonParsed = JSON.parse(jsonContent);
    } catch (parseError: any) {
      console.error("JSON parsing error:", parseError, "Body:", responseText);
      return NextResponse.json({
         success: false,
         error: "AI failed to return valid JSON format."
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: jsonParsed
    });

  } catch (error: any) {
    console.error('Question Generation Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Generation failed'
    }, { status: 500 });
  }
}
