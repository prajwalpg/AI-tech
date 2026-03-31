import { prisma } from '../prisma';

export async function saveMemory(userId: string, data: any) {
  try {
    // Basic implementation: storing as a serialized string inside a custom table
    // or as doubt history based on schema.
    await prisma.doubt.create({
      data: {
        studentId: userId,
        question: `Memory Action: ${data.topic || 'General Learning'}`,
        answer: 'Logged as memory event',
        wasAnsweredByAI: true
        // Here we just use Doubt as a vehicle since it exists for students
      }
    });
    return true;
  } catch (error) {
    console.error("Failed to save memory", error);
    return false;
  }
}

export async function getMemory(userId: string) {
  try {
    const memories = await prisma.doubt.findMany({
      where: { studentId: userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return memories.map(m => m.question).join('\n');
  } catch (error) {
    return "";
  }
}
