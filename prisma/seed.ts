import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a test company
  const company = await prisma.company.upsert({
    where: { email: 'test@construction.com' },
    update: {},
    create: {
      name: 'Test Construction Company',
      email: 'test@construction.com',
      phone: '+1 (555) 123-4567',
      address: '123 Construction Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
    },
  });

  console.log('Created company:', company.name);

  // Create admin user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminUser = await prisma.user.upsert({
    where: {
      companyId_email: {
        companyId: company.id,
        email: 'admin@construction.com',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      email: 'admin@construction.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
    },
  });

  console.log('Created admin user:', adminUser.email);

  // Create regular user
  const regularUser = await prisma.user.upsert({
    where: {
      companyId_email: {
        companyId: company.id,
        email: 'user@construction.com',
      },
    },
    update: {},
    create: {
      companyId: company.id,
      email: 'user@construction.com',
      password: hashedPassword,
      firstName: 'Regular',
      lastName: 'User',
      role: 'user',
      isActive: true,
    },
  });

  console.log('Created regular user:', regularUser.email);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

