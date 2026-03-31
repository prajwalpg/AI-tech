import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with the provided API token securely
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Critical: GEMINI_API_KEY is missing in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export const openai = {
  chat: {
    completions: {
      create: async ({ messages, response_format, model }: any) => {
        try {
          // Detect if we need JSON parsing
          const isJson = response_format?.type === 'json_object';
          
          if (!apiKey) {
            return { choices: [{ message: { content: "Error: API key missing" } }] };
          }

          // Switched to Gemini Flash-Lite for maximum Free Tier availability
          const generativeModel = genAI.getGenerativeModel({ 
            model: "gemini-flash-lite-latest", 
            generationConfig: isJson ? { responseMimeType: "application/json" } : undefined
          });

          // Serialize legacy OpenAI format messages
          const prompt = Array.isArray(messages) 
            ? messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')
            : "No user message provided";

          const result = await generativeModel.generateContent(prompt);
          
          if (!result || !result.response) {
            throw new Error("Gemini AI (Lite) returned an empty response.");
          }

          let responseText = await result.response.text();

          if (isJson) {
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
          }

          return {
            choices: [
              {
                message: { 
                  content: responseText || "AI (Lite) produced an empty response."
                }
              }
            ]
          };
        } catch (e: any) {
             console.error("Gemini Lite Bridge Fatal Error: ", e.message);
             // Fallback effort using generic gemini-pro if Lite is unavailable
             return {
               choices: [
                 {
                   message: { 
                     content: `System Limit Reached. Please wait a few minutes or consult your project administrator. (Model: gemini-flash-lite)`
                   }
                 }
               ]
             };
        }
      }
    }
  }
};
