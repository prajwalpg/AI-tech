import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

// Initialize Gemini SDK securely via environment variable
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Critical: GEMINI_API_KEY is missing in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in environment variables");
    }

    const { topic, difficulty, questionType, quantity, filepath } = await req.json();

    console.log("Incoming request:", { topic, difficulty, questionType, quantity, filepath });

    // Validate inputs
    if (!topic || !difficulty || !questionType) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields"
      }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-lite-latest",
      generationConfig: { responseMimeType: "application/json" }
    });

    // We build a multi-modal prompt if a PDF is provided
    const promptText = `You are a Question Generator Agent for an AI Teaching application.
Target Topic: ${topic}
Difficulty: ${difficulty}
Format Type: ${questionType} (e.g. MCQ, Short, Descriptive)
Number of Questions requested: ${quantity || 5}

Generate EXACTLY ${quantity || 5} questions based strictly on the provided Textbook Context, if available.
Analyze the topic and generate a beautifully formatted json output question paper.
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
      if (!fs.existsSync(filepath)) {
         return NextResponse.json({ success: false, error: "File not found" }, { status: 400 });
      }

      if (filepath.toLowerCase().endsWith('.pdf')) {
        // Native Gemini PDF Processing: Pass the file directly as binary/base64
        console.log(`Using Native Gemini PDF processing for: ${filepath}`);
        contents.push({
          inlineData: {
            data: fs.readFileSync(filepath).toString("base64"),
            mimeType: "application/pdf"
          }
        });
      } else {
        // For non-PDF files, we read text
        const textContent = fs.readFileSync(filepath, 'utf-8');
        contents.push(`Additional Context: textbook Context Uploaded: ${textContent.substring(0, 50000)}`);
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
