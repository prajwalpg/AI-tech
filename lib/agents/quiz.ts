import { openai } from './openai';

export async function runQuizAgent(topic: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
  const systemPrompt = `You are a Quiz Generation Agent.
Generate multiple-choice questions, short answers, and structural questions on the given topic.
Difficulty level: ${difficulty}.
Always return the output in a clean JSON format containing an array of 'questions'.
Each question should have:
- type: 'mcq', 'short_answer', or 'coding'
- question: the text
- options: array of options (if mcq)
- answer: correct answer
- explanation: why it's correct`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Topic: ${topic}\nReturn JSON.` }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.5,
  });

  return JSON.parse(response.choices[0]?.message?.content || '{"questions": []}');
}
