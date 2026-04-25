import { prisma } from '../lib/prisma';

async function main() {
  try {
    const users = await prisma.user.findMany({ take: 1 });
    console.log("Success! Users found: " + users.length);
  } catch (e: any) {
    console.error("Database error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
