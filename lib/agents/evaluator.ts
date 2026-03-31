import { openai } from './openai';

export async function runEvaluatorAgent(question: string, studentAnswer: string, expectedAnswer?: string) {
  const systemPrompt = `You are a highly analytical Evaluator Agent.
Your job is to read the student's answer to a given question and evaluate it.
You must provide:
1. score (out of 10)
2. feedback (helpful critique on what they got right, wrong, and how to improve)
3. correct_answer (the definitive correct answer, particularly if they were wrong)

Always return the output in a clean JSON format containing 'score', 'feedback', and 'correct_answer'.`;

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Question: ${question}\nStudent Answer: ${studentAnswer}\nExpected (if any): ${expectedAnswer || 'N/A'}` }
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  return JSON.parse(response.choices[0]?.message?.content || '{"score": 0, "feedback": "Unknown error", "correct_answer": ""}');
}
