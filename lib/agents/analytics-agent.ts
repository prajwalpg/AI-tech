import { openai } from './openai';
import { prisma } from '../prisma';

export async function runAnalyticsAgent(userId: string) {
  // Find recent student activity/doubts from Knowledge base
  let doubts: any[] = [];
  try {
    doubts = await prisma.doubt.findMany({
      where: { studentId: userId },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
  } catch(e) { /* ignore if schema is partial */ }

  const prompt = `You are a Student Analytics Engine.
Analyze the student's recent queries/doubts and progress:
Recent Queries: ${doubts.map((d: any) => d.question).join('; ') || 'No queries yet, calculate baseline based on random 10th grade physics topics'}

Return EXACTLY a JSON structure:
{
  "weakTopics": ["Topic 1", "Topic 2"],
  "strengths": ["Topic 3"],
  "recommendations": ["Do this", "Study that"],
  "progressScore": 85
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an Educational Analytics Expert.' },
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
      weakTopics: ["Unknown"],
      strengths: ["Unknown"],
      recommendations: ["Take more quizzes"],
      progressScore: 0
    };
  }
}
