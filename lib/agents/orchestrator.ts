import { openai } from './openai';
import { answerStudentDoubt } from './student-agent';
import { generateContent } from './content-agent';
import { runTeacherAgent } from './teacher';
import { runQuizAgent } from './quiz';
import { runEvaluatorAgent } from './evaluator';
import { runRecommendationAgent } from './recommendation';
import { runRetrievalAgent } from './retrieval';
import { runCodeAgent } from './code-agent';
import { runAnalyticsAgent } from './analytics-agent';

export type AgentRole = 'teacher' | 'quiz' | 'evaluator' | 'recommendation' | 'content' | 'retrieval' | 'code' | 'analytics' | 'student';

export async function orchestrate(userId: string, input: string, context?: any) {
  // Step 1: Classify intent
  const systemPrompt = `You are a Master Orchestrator for an AI Teaching Platform. 
Classify the user input into ONE of these agents:
- teacher: learning doubts, requesting explanations
- quiz: generating quizzes/questions
- evaluator: grading an answer
- recommendation: asking what to study next
- content: generating notes/worksheets (Teacher side)
- retrieval: retrieving specific documents
- code: programming help, debugging
- analytics: checking progress, weak topics
- student: answering student doubts based on Knowledge Base only

Return exactly ONE word from the above list.`;

  let agentUsed: AgentRole = 'student';
  let responseData: any = '';
  let additionalData: any = {};

  try {
    const classification = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input }
      ],
      temperature: 0,
      max_tokens: 10,
    });

    agentUsed = (classification.choices?.[0]?.message?.content?.toLowerCase().trim() || 'student') as AgentRole;
  } catch (error: any) {
    console.error("Orchestrator Classification Error:", error);
    agentUsed = 'student'; // Fallback to student agent if classification fails
  }

  try {
    switch (agentUsed) {
      case 'teacher':
        const teacherContext = await runRetrievalAgent(input);
        responseData = await runTeacherAgent(input, teacherContext);
        break;
      case 'student':
        // Real-time integration: Automatically fetch knowledge base context for every student doubt
        const studentContext = await runRetrievalAgent(input, context?.subject);
        responseData = await answerStudentDoubt(input, studentContext);
        break;
      case 'content':
        responseData = await generateContent(input, context?.curriculum || '', 'notes');
        break;
      case 'quiz':
        responseData = await runQuizAgent(input, context?.difficulty || 'medium');
        break;
      case 'evaluator':
        responseData = await runEvaluatorAgent(input, context?.answer || '', context?.expected || '');
        break;
      case 'recommendation':
        responseData = await runRecommendationAgent(context?.history || [], input, context?.score || 5);
        break;
      case 'retrieval':
        responseData = await runRetrievalAgent(input, context?.subject);
        break;
      case 'code':
        responseData = await runCodeAgent({ code: context?.code || '', language: context?.lang || 'javascript', task: input });
        break;
      case 'analytics':
        responseData = await runAnalyticsAgent(userId);
        break;
      default:
        const fallbackContext = await runRetrievalAgent(input);
        responseData = await answerStudentDoubt(input, fallbackContext);
    }

    return {
      success: true,
      agentUsed,
      data: responseData,
      message: typeof responseData === 'string' ? responseData : 'Operation successful'
    };
  } catch (error: any) {
    console.error("AGENT RUNTIME ERROR:", error);
    return {
      success: false,
      agentUsed: agentUsed || 'student',
      data: `System error in ${agentUsed || 'Agent'}: ${error.message || 'Wait a moment and try again.'}`,
      message: error.message || 'Agent execution failed'
    };
  }
}
