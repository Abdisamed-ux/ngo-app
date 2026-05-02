import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const usersCount = await prisma.users.count();
  const users = await prisma.users.findMany({ take: 5 });
  console.log('Users count:', usersCount);
  console.log('Users:', JSON.stringify(users, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
