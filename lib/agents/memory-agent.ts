import { prisma } from '../prisma';

export async function saveMemory(userId: string, data: any) {
  try {
    const valueStr = JSON.stringify(data);
    
    const existing = await prisma.memory.findFirst({
      where: { userId, key: 'session' }
    });

    if (existing) {
      await prisma.memory.update({
        where: { id: existing.id },
        data: { value: valueStr }
      });
    } else {
      await prisma.memory.create({
        data: {
          userId,
          key: 'session',
          value: valueStr
        }
      });
    }
    return true;
  } catch (error) {
    console.error("Failed to save memory", error);
    return false;
  }
}

export async function getMemory(userId: string) {
  try {
    const memory = await prisma.memory.findFirst({
      where: { userId, key: 'session' },
      orderBy: { updatedAt: 'desc' }
    });
    
    if (memory && memory.value) {
      const parsed = JSON.parse(memory.value);
      return JSON.stringify(parsed);
    }
    return "";
  } catch (error) {
    return "";
  }
}
