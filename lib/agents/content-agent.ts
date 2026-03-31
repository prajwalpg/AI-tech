import { openai } from './openai';

export async function generateContent(topic: string, curriculumContext: string, type: 'notes' | 'key_concepts' | 'worksheet' | 'questions') {
  const systemPrompt = `You are a Content Generation Agent for teachers.
Your task is to generate highly accurate, syllabus-aligned educational content.
Content type requested: ${type}.
Format the output in clean Markdown.
Do NOT hallucinate. Strictly adhere to the provided curriculum context.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context:\n${curriculumContext}\n\nTopic: ${topic}` }
    ],
    temperature: 0.2,
  });

  return response.choices[0]?.message?.content || 'Failed to generate content.';
}
