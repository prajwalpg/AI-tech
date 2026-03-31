import { openai } from './openai';

export async function runRecommendationAgent(userHistory: any[], currentTopic: string, score: number) {
  const systemPrompt = `You are a sophisticated Recommendation Agent.
Given a student's past topics, their current topic, and their score on the latest quiz, recommend what they should learn next.
If score < 5, recommend revising the topic with a simpler explanation.
If score >= 5, suggest the logical next topic.
Return JSON with:
1. 'next_topic' (string)
2. 'reasoning' (why this is recommended)
3. 'suggested_resources' (array of strings, like 'Watch video on X', etc.)`;

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `History: ${JSON.stringify(userHistory)}\nTopic: ${currentTopic}\nScore: ${score}/10` }
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    response_format: { type: 'json_object' },
    temperature: 0.5,
  });

  return JSON.parse(response.choices[0]?.message?.content || '{"next_topic": "", "reasoning": "Fallback", "suggested_resources": []}');
}
