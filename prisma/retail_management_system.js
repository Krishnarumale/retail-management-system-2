const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default users
  console.log('👤 Creating default users...');
  
  const users = [
    {
      username: 'admin',
      email: 'admin@retailpro.com',
      password: 'password123',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN'
    },
    {
      username: 'manager',
      email: 'manager@retailpro.com',
      password: 'password123',
      firstName: 'Store',
      lastName: 'Manager',
      role: 'MANAGER'
    },
    {
      username: 'employee',
      email: 'employee@retailpro.com',
      password: 'password123',
      firstName: 'Store',
      lastName: 'Employee',
      role: 'EMPLOYEE'
    },
    {
      username: 'cashier',
      email: 'cashier@retailpro.com',
      password: 'password123',
      firstName: 'Store',
      lastName: 'Cashier',
      role: 'CASHIER'
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
      address: '123 Main Street',
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
    const existingCategory = await prisma.category.findFirst({
      where: { name: categoryData.name }
    });

    if (!existingCategory) {
      await prisma.category.create({
        data: categoryData
      });
    }
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
    const existingSupplier = await prisma.supplier.findFirst({
      where: { name: supplierData.name }
    });

    if (!existingSupplier) {
      await prisma.supplier.create({
        data: supplierData
      });
    }
  }

  // Create sample products
  console.log('📦 Creating sample products...');
  
  const electronicsCategory = await prisma.category.findFirst({
    where: { name: 'Electronics' }
  });

  const clothingCategory = await prisma.category.findFirst({
    where: { name: 'Clothing' }
  });

  const techSupplier = await prisma.supplier.findFirst({
    where: { name: 'TechCorp Supplies' }
  });

  const fashionSupplier = await prisma.supplier.findFirst({
    where: { name: 'Fashion Wholesale' }
  });

  const products = [
    {
      sku: 'PHONE001',
      name: 'Smartphone Pro',
      description: 'Latest smartphone with advanced features',
      categoryId: electronicsCategory.id,
      supplierId: techSupplier.id,
      costPrice: 400.00,
      sellingPrice: 599.99,
      minStockLevel: 5,
      maxStockLevel: 50,
      barcode: '1234567890123'
    },
    {
      sku: 'LAPTOP001',
      name: 'Business Laptop',
      description: 'High-performance laptop for business use',
      categoryId: electronicsCategory.id,
      supplierId: techSupplier.id,
      costPrice: 800.00,
      sellingPrice: 1199.99,
      minStockLevel: 3,
      maxStockLevel: 20,
      barcode: '1234567890124'
    },
    {
      sku: 'SHIRT001',
      name: 'Cotton T-Shirt',
      description: 'Comfortable cotton t-shirt',
      categoryId: clothingCategory.id,
      supplierId: fashionSupplier.id,
      costPrice: 8.00,
      sellingPrice: 19.99,
      minStockLevel: 20,
      maxStockLevel: 100,
      barcode: '1234567890125'
    },
    {
      sku: 'JEANS001',
      name: 'Denim Jeans',
      description: 'Classic blue denim jeans',
      categoryId: clothingCategory.id,
      supplierId: fashionSupplier.id,
      costPrice: 25.00,
      sellingPrice: 49.99,
      minStockLevel: 15,
      maxStockLevel: 75,
      barcode: '1234567890126'
    }
  ];

  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {},
      create: productData
    });

    // Create inventory for the product
    await prisma.inventory.upsert({
      where: {
        productId_storeId: {
          productId: product.id,
          storeId: store.id
        }
      },
      update: {},
      create: {
        productId: product.id,
        storeId: store.id,
        quantityOnHand: Math.floor(Math.random() * 50) + 10, // Random quantity between 10-60
        quantityReserved: 0
      }
    });
  }

  // Create sample customers
  console.log('👥 Creating sample customers...');
  
  const customers = [
    {
      customerCode: 'CUST000001',
      firstName: 'John',
      lastName: 'Customer',
      email: 'john.customer@email.com',
      phone: '555-1001',
      address: '123 Customer Street',
      city: 'Customer City',
      state: 'Customer State',
      zipCode: '11111',
      customerType: 'REGULAR'
    },
    {
      customerCode: 'CUST000002',
      firstName: 'Jane',
      lastName: 'VIP',
      email: 'jane.vip@email.com',
      phone: '555-1002',
      address: '456 VIP Avenue',
      city: 'VIP City',
      state: 'VIP State',
      zipCode: '22222',
      customerType: 'VIP'
    }
  ];

  for (const customerData of customers) {
    const customer = await prisma.customer.upsert({
      where: { customerCode: customerData.customerCode },
      update: {},
      create: {
        ...customerData,
        preferences: {
          create: {
            emailNotifications: true,
            smsNotifications: false,
            promotionalEmails: true,
            preferredContactMethod: 'EMAIL'
          }
        }
      }
    });
  }

  // Create sample leads
  console.log('🎯 Creating sample leads...');
  
  const managerUser = await prisma.user.findFirst({
    where: { username: 'manager' }
  });

  const leads = [
    {
      firstName: 'Potential',
      lastName: 'Customer',
      email: 'potential@email.com',
      phone: '555-2001',
      source: 'website',
      status: 'NEW',
      assignedTo: managerUser.id,
      estimatedValue: 500.00,
      notes: 'Interested in electronics'
    },
    {
      firstName: 'Another',
      lastName: 'Lead',
      email: 'another@email.com',
      phone: '555-2002',
      source: 'referral',
      status: 'CONTACTED',
      assignedTo: managerUser.id,
      estimatedValue: 1000.00,
      notes: 'Looking for business solutions'
    }
  ];

  for (const leadData of leads) {
    await prisma.lead.create({
      data: leadData
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log('- Created 4 users (admin, manager, employee, cashier)');
  console.log('- Created 1 store location');
  console.log('- Created 5 product categories');
  console.log('- Created 2 suppliers');
  console.log('- Created 4 sample products with inventory');
  console.log('- Created 2 sample customers');
  console.log('- Created 2 sample leads');
  console.log('\n🔐 Login credentials:');
  console.log('- Admin: admin / password123');
  console.log('- Manager: manager / password123');
  console.log('- Employee: employee / password123');
  console.log('- Cashier: cashier / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
