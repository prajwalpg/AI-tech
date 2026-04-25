import { openai } from './openai';
import { prisma } from '../prisma';

export async function runAnalyticsAgent(userId: string) {
  let doubts: any[] = [];
  try {
    doubts = await prisma.doubt.findMany({
      where: { studentId: userId },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
  } catch(e) { /* ignore if schema is partial */ }

  if (doubts.length === 0) {
    return {
      weakTopics: [],
      strengths: [],
      recommendations: ["Start a conversation with the AI tutor to get personalized recommendations!", "Complete your first lesson to track your progress."],
      progressScore: 0,
      isNewStudent: true
    };
  }

  const prompt = `You are a Student Analytics Engine.
Analyze ONLY the provided queries. Do not invent topics not present in the data.
Recent Queries: ${doubts.map((d: any) => d.question).join('; ')}

Return EXACTLY a JSON structure:
{
  "weakTopics": ["Topic 1", "Topic 2"],
  "strengths": ["Topic 3"],
  "recommendations": ["Do this", "Study that"],
  "progressScore": 85,
  "isNewStudent": false
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an Educational Analytics Expert. Analyze ONLY the provided queries. Do not invent topics not present in the data.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' }
  });

  try {
    const rawContent = response.choices[0]?.message?.content || '{}';
    return JSON.parse(rawContent);
  } catch (error) {
    console.error("Analytics parsing failed:", response.choices[0]?.message?.content);
    return {
      weakTopics: ["Unknown"],
      strengths: ["Unknown"],
      recommendations: ["Review recent material"],
      progressScore: 0,
      isNewStudent: false
    };
  }
}
