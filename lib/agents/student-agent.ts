import { openai } from './openai';

export async function answerStudentDoubt(question: string, knowledgeBaseContext: string) {
  const systemPrompt = `You are a Student AI Assistant.
Your ONLY source of knowledge is the provided teacher-approved Knowledge Base Context.
You are NOT a general AI. You must ONLY answer based on the teacher's content provided below.
If the answer to the student's question is NOT found in the provided context, you must reply EXACTLY with: 'Consult your teacher'.
Do NOT hallucinate or use outside knowledge. Explain concepts simply and clearly based on the context.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Knowledge Base Context:\n${knowledgeBaseContext}\n\nStudent Doubt: ${question}` }
    ],
    temperature: 0.1,
  });

  return response.choices[0]?.message?.content || 'Consult your teacher.';
}
