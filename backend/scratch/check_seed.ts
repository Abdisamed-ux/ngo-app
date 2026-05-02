import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const regions = await prisma.regions.count();
  const aidTypes = await prisma.aid_types.count();
  const aidCategories = await prisma.aid_categories.count();
  
  console.log('Regions count:', regions);
  console.log('Aid Types count:', aidTypes);
  console.log('Aid Categories count:', aidCategories);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
