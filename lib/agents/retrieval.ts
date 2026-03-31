import { openai } from './openai';
import { prisma } from '../prisma';

// This acts as a mock vector store interface, ready for Pinecone or FAISS.
export async function generateEmbedding(text: string) {
  // We use the bridge to get embeddings
  const result = await (openai as any).embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return result.data[0].embedding;
}

/**
 * Real-time Retrieval Agent
 * Fetches relevant context from the teacher-approved Knowledge Base.
 */
export async function runRetrievalAgent(query: string, subjectHint?: string) {
  try {
    console.log(`Retrieval Agent: Searching for context for query: "${query}"`);

    // 1. Fetch relevant entries from the KnowledgeBase
    // Since SQLite doesn't support vector search, we use a robust keyword match across title, topic and content.
    const searchTerms = query.split(' ').filter(word => word.length > 3);
    
    // Prioritize direct topic matches first
    const kbEntries = await prisma.knowledgeBase.findMany({
      where: {
        OR: [
          { topic: { contains: query } },
          { title: { contains: query } },
          { content: { contains: query } },
          ...searchTerms.map(term => ({ topic: { contains: term } })),
          ...searchTerms.map(term => ({ title: { contains: term } }))
        ],
        ...(subjectHint ? { subject: subjectHint } : {})
      },
      take: 5,
      orderBy: { updatedAt: 'desc' }
    });


    if (kbEntries.length === 0) {
      // Fallback: If no direct matches, try matching by subject if hint provided
      if (subjectHint) {
        const fallbackEntries = await prisma.knowledgeBase.findMany({
          where: { subject: subjectHint },
          take: 3,
          orderBy: { updatedAt: 'desc' }
        });
        if (fallbackEntries.length > 0) {
          return fallbackEntries.map(e => `[Topic: ${e.topic}]\n${e.content}`).join('\n\n');
        }
      }
      return ""; // No context found
    }

    // 2. Synthesize the context
    const context = kbEntries.map(e => {
      return `[Source: ${e.title} | Topic: ${e.topic}]\n${e.content}`;
    }).join('\n\n---\n\n');

    console.log(`Retrieval Agent: Found ${kbEntries.length} relevant context snippets content.`);
    return context;

  } catch (error) {
    console.error("Retrieval Agent Error:", error);
    return ""; // Return empty context on error to let the student agent handle it
  }
}
