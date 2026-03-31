import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const deleted = await prisma.lesson.deleteMany({
    where: { subject: 'CHEMISTRY' }
  })
  console.log(`Deleted ${deleted.count} chemistry lessons.`)
}
main().catch(console.error).finally(() => prisma.$disconnect())
