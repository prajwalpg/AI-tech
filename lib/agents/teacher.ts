import { openai } from './openai';

export async function runTeacherAgent(prompt: string, context?: string) {
  const systemPrompt = `You are a highly skilled Teacher Agent.
Your goal is to explain concepts in simple terms, generate examples, and adapt explanations based on the student's level.
If context is provided, use it to ground your explanation.
Respond in clear, structured Markdown.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context: ${context || 'None'}\n\nStudent Query: ${prompt}` }
    ],
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || 'No response from Teacher Agent.';
}
