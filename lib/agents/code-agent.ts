import { openai } from './openai';

interface CodeInput {
  code: string;
  language: string;
  task: string;
}

export async function runCodeAgent({ code, language, task }: CodeInput) {
  const prompt = `You are a Code/Programming AI Assistant in a Teaching Platform.
Task: ${task}
Language: ${language}

Analyze the following code:
\`\`\`${language}
${code}
\`\`\`

Return the output EXACTLY in this JSON structure (with no markdown block wrappers around the JSON if possible, but valid JSON is required):
{
  "explanation": "Detailed step-by-step explanation",
  "issues": ["bug 1", "bug 2"],
  "improvedCode": "Complete optimized code matching the language"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a Programming Expert.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' }
  });

  try {
    const rawContent = response.choices[0]?.message?.content || '{}';
    return JSON.parse(rawContent);
  } catch (error) {
    return {
      explanation: "Failed to parse API output.",
      issues: ["Internal Parsing Error"],
      improvedCode: code
    };
  }
}
