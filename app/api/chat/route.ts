import { NextResponse } from 'next/server';
import { orchestrate } from '@/lib/agents/orchestrator';
import { saveMemory, getMemory } from '@/lib/agents/memory-agent';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limiter';
import { requireAuth } from '@/lib/auth-guards';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  userId: z.string().optional(),
  context: z.object({}).passthrough().optional()
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;
    
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment.", retryAfter: Math.ceil(rateLimit.resetIn / 1000) },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)), 'X-RateLimit-Remaining': '0' } }
      );
    }

    const body = await req.json();
    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    
    const { message, context } = parsed.data;
    const actualUserId = user.id;

    const memory = await getMemory(actualUserId);
    
    const fullContext = {
      ...context,
      history: memory
    };

    const orchestratorResult = await orchestrate(actualUserId, message, fullContext);

    try {
      const isAnsweredFromKB = orchestratorResult.agentUsed === 'student' && !orchestratorResult.data.includes('Consult your teacher');
      
      await prisma.doubt.create({
        data: {
          studentId: actualUserId,
          question: message,
          answer: typeof orchestratorResult.data === 'string' ? orchestratorResult.data : JSON.stringify(orchestratorResult.data),
          wasAnsweredByAI: isAnsweredFromKB
        }
      });
    } catch (dbError) {
      console.error("Doubt logging failed, but proceeding with chat response:", dbError);
    }

    return NextResponse.json({
      agentUsed: orchestratorResult.agentUsed,
      response: orchestratorResult.data,
      additionalData: {
        success: orchestratorResult.success,
        message: orchestratorResult.message
      }
    }, {
      headers: {
        'X-RateLimit-Remaining': String(rateLimit.remaining)
      }
    });

  } catch (error: any) {
    console.error("FATAL ERROR IN API CHAT:", error);
    return NextResponse.json(
      { agentUsed: "error", response: "Critical system error in Orchestrator.", additionalData: { error: error.message, stack: error.stack } },
      { status: 500 }
    );
  }
}

