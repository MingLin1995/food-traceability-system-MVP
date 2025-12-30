
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedIngredients() {
  console.log('Seeding Ingredients...');
  // Clear existing data
  await prisma.ingredient.deleteMany({});

  // Seed Ingredients
  await prisma.ingredient.createMany({
    data: [
      {
        batchNumber: 'MG20241201-001',
        name: '愛文芒果',
        origin: '台南玉井',
        supplier: '玉井果農合作社',
        productionDate: new Date('2024-12-01'),
        expiryDate: new Date('2024-12-15'),
        testResult: '合格',
        testDetails: {
          pesticide: '0.01ppm',
          heavyMetal: '未檢出',
          bacteria: '陰性',
        },
      },
      {
        batchNumber: 'BA20241202-002',
        name: '香蕉',
        origin: '高雄旗山',
        supplier: '旗山農會',
        productionDate: new Date('2024-12-02'),
        expiryDate: new Date('2024-12-10'),
        testResult: '合格',
        testDetails: {
          pesticide: '未檢出',
        },
      },
    ],
  });
  console.log('Ingredients seeded.');
}


async function seedAdminAccounts() {
  console.info('Checking admin accounts seeding status...');

  const initFlag = await prisma.systemConfig.findUnique({
    where: { key: 'admin_accounts_setup_completed' },
  });

  if (initFlag) {
    console.info('Admin default accounts already seeded, skipping.');
    return;
  }

  console.info('Starting admin accounts seeding...');

  const defaultAdmins = [
    {
      account: process.env.ADMIN_ACCOUNT_1 || 'admin001',
      password: process.env.ADMIN_PASSWORD_1 || '000000',
    },
    {
      account: process.env.ADMIN_ACCOUNT_2 || 'admin002',
      password: process.env.ADMIN_PASSWORD_2 || '000000',
    },
    {
      account: process.env.ADMIN_ACCOUNT_3 || 'admin003',
      password: process.env.ADMIN_PASSWORD_3 || '000000',
    },
  ];

  for (const admin of defaultAdmins) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    await prisma.user.create({
      data: {
        account: admin.account,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.info(`Admin account ${admin.account} created successfully.`);
  }

  await prisma.systemConfig.create({
    data: {
      key: 'admin_accounts_setup_completed',
      value: 'true',
    },
  });

  console.info('Admin accounts seeding completed!');
}

async function main() {
  try {
    await seedIngredients();
    await seedAdminAccounts();
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
