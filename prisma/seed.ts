import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Example users with different profiles
  const exampleUsers = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com', 
      password: 'password123'
    },
    {
      name: 'Mike Johnson',
      email: 'mike@example.com',
      password: 'password123'
    },
    {
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      password: 'password123'
    },
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123'
    }
  ];

  console.log('👤 Creating example users...');

  for (const userData of exampleUsers) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      console.log(`⚠️  User ${userData.email} already exists, skipping...`);
      continue;
    }

    // Hash password using same method as signup route
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });

    console.log(`✅ Created user: ${user.name} (${user.email})`);
  }

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📝 Login credentials for testing:');
  console.log('================================');
  
  exampleUsers.forEach(user => {
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${user.password}`);
    console.log('---');
  });
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 