import { PrismaClient, Role, DonationStatus, UrgencyLevel, AidRequestStatus, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Regions
  const regions = [
    { name: 'Northern Region' },
    { name: 'Southern Region' },
    { name: 'Eastern Region' },
    { name: 'Western Region' },
    { name: 'Central Region' },
  ];

  for (const r of regions) {
    await prisma.regions.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }
  console.log('Regions seeded.');

  // 2. Aid Types
  const aidTypes = [
    { name: 'Food & Nutrition' },
    { name: 'Emergency Shelter' },
    { name: 'Medical Supplies' },
    { name: 'Clean Water & Sanitation' },
    { name: 'Education Support' },
    { name: 'Cash Assistance' },
  ];

  for (const at of aidTypes) {
    await prisma.aid_types.upsert({
      where: { name: at.name },
      update: {},
      create: at,
    });
  }
  console.log('Aid Types seeded.');

  // 3. Aid Categories (for Donations)
  const aidCategories = [
    { name: 'General Fund' },
    { name: 'Disaster Relief' },
    { name: 'Health' },
    { name: 'Education' },
    { name: 'Infrastructure' },
  ];

  for (const ac of aidCategories) {
    await prisma.aid_categories.upsert({
      where: { name: ac.name },
      update: {},
      create: ac,
    });
  }
  console.log('Aid Categories seeded.');

  // 4. Default Admin User if not exists
  const adminEmail = 'admin@ngo.org';
  const hashedPassword = await bcrypt.hash('password123', 12);

  await prisma.users.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password_hash: hashedPassword,
      full_name: 'System Admin',
      role: 'NGO_ADMIN' as Role,
      is_active: true,
    },
  });
  console.log(`Admin user created: ${adminEmail} / password123`);

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
