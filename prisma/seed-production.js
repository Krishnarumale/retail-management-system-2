const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting production database seeding...');

  // Create default users
  console.log('👤 Creating default users...');
  
  const users = [
    {
      username: 'admin',
      email: 'admin@retailpro.com',
      password: 'Admin123!',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN'
    },
    {
      username: 'manager',
      email: 'manager@retailpro.com',
      password: 'Manager123!',
      firstName: 'Store',
      lastName: 'Manager',
      role: 'MANAGER'
    },
    {
      username: 'employee',
      email: 'employee@retailpro.com',
      password: 'Employee123!',
      firstName: 'Store',
      lastName: 'Employee',
      role: 'EMPLOYEE'
    }
  ];

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    await prisma.user.upsert({
      where: { username: userData.username },
      update: {},
      create: {
        username: userData.username,
        email: userData.email,
        passwordHash: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role
      }
    });
  }

  // Create default store
  console.log('🏪 Creating default store...');
  
  const adminUser = await prisma.user.findUnique({
    where: { username: 'admin' }
  });

  const store = await prisma.store.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Main Store',
      address: '123 Business Street',
      city: 'Business City',
      state: 'Business State',
      zipCode: '12345',
      phone: '555-0123',
      email: 'store@retailpro.com',
      managerId: adminUser.id
    }
  });

  // Assign users to store
  console.log('🔗 Assigning users to store...');
  
  const allUsers = await prisma.user.findMany();
  
  for (const user of allUsers) {
    await prisma.userStore.upsert({
      where: {
        userId_storeId: {
          userId: user.id,
          storeId: store.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        storeId: store.id
      }
    });
  }

  // Create product categories
  console.log('📂 Creating product categories...');
  
  const categories = [
    { name: 'Electronics', description: 'Electronic devices and accessories' },
    { name: 'Clothing', description: 'Apparel and fashion items' },
    { name: 'Home & Garden', description: 'Home improvement and garden supplies' },
    { name: 'Books', description: 'Books and educational materials' },
    { name: 'Sports', description: 'Sports equipment and accessories' }
  ];

  for (const categoryData of categories) {
    await prisma.category.upsert({
      where: { name: categoryData.name },
      update: {},
      create: categoryData
    });
  }

  // Create suppliers
  console.log('🚚 Creating suppliers...');
  
  const suppliers = [
    {
      name: 'TechCorp Supplies',
      contactPerson: 'John Smith',
      email: 'orders@techcorp.com',
      phone: '555-0100',
      address: '456 Tech Avenue',
      city: 'Tech City',
      state: 'Tech State',
      zipCode: '54321'
    },
    {
      name: 'Fashion Wholesale',
      contactPerson: 'Jane Doe',
      email: 'sales@fashionwholesale.com',
      phone: '555-0200',
      address: '789 Fashion Blvd',
      city: 'Fashion City',
      state: 'Fashion State',
      zipCode: '67890'
    }
  ];

  for (const supplierData of suppliers) {
    await prisma.supplier.upsert({
      where: { name: supplierData.name },
      update: {},
      create: supplierData
    });
  }

  console.log('✅ Production database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log('- Created 3 users (admin, manager, employee)');
  console.log('- Created 1 store location');
  console.log('- Created 5 product categories');
  console.log('- Created 2 suppliers');
  console.log('\n🔐 Login credentials:');
  console.log('- Admin: admin / Admin123!');
  console.log('- Manager: manager / Manager123!');
  console.log('- Employee: employee / Employee123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during production seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
