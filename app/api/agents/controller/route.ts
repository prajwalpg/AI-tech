import { NextResponse } from 'next/server';
import { openai } from '@/lib/agents/openai';
import { runTeacherAgent } from '@/lib/agents/teacher';
import { runQuizAgent } from '@/lib/agents/quiz';
import { runEvaluatorAgent } from '@/lib/agents/evaluator';
import { runRecommendationAgent } from '@/lib/agents/recommendation';
import { runRetrievalAgent } from '@/lib/agents/retrieval';

// The Controller acts as an orchestrator, classifying intent and routing.
export async function POST(req: Request) {
  try {
    const { action, history, currentTopic, ...params } = await req.json();

    // Ensure we have a valid required payload
    // You can also add LLM intent classification here if 'action' isn't explicitly provided.
    let intent = action;
    if (!intent) {
      const intentCheck = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          ...history,
          { role: 'user', content: 'What is the intent of the user? Classify as: TEACHER, QUIZ, EVALUATOR, RECOMMENDATION, RETRIEVAL. Return ONLY the word.' }
        ],
        temperature: 0,
      });
      intent = (intentCheck.choices[0]?.message?.content || 'TEACHER').trim().toUpperCase();
    }

    let result: any;

    switch (intent) {
      case 'TEACHER':
        const rContext = await runRetrievalAgent(currentTopic);
        const explanation = await runTeacherAgent(currentTopic, rContext);
        result = { type: 'teacher', content: explanation };
        break;
        
      case 'QUIZ':
        const quiz = await runQuizAgent(currentTopic, params.difficulty || 'medium');
        result = { type: 'quiz', content: quiz };
        break;

      case 'EVALUATOR':
        const evaluation = await runEvaluatorAgent(
          params.question,
          params.studentAnswer,
          params.expectedAnswer
        );
        result = { type: 'evaluation', content: evaluation };
        // We can seamlessly trigger recommendation after evaluation
        if (evaluation.score !== undefined) {
          const recs = await runRecommendationAgent(history, currentTopic, evaluation.score);
          result.recommendation = recs;
        }
        break;

      case 'RECOMMENDATION':
        const pureRecs = await runRecommendationAgent(history, currentTopic, params.score || 5);
        result = { type: 'recommendation', content: pureRecs };
        break;

      case 'RETRIEVAL':
        const docs = await runRetrievalAgent(params.query);
        result = { type: 'retrieval', content: docs };
        break;

      default:
        result = { type: 'error', content: 'Unknown action or intent.' };
        break;
    }

    return NextResponse.json({ success: true, intent, result });
  } catch (error: any) {
    console.error('Controller Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server Error' }, { status: 500 });
  }
}
