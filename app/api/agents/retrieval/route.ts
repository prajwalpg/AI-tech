import { NextResponse } from 'next/server';
import { runRetrievalAgent } from '@/lib/agents/retrieval';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    const docs = await runRetrievalAgent(query);
    return NextResponse.json({ success: true, docs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
