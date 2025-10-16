import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zuna-xosokeno');
    console.log('✅ Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    
    if (existingSuperAdmin) {
      console.log('❌ Super admin already exists:', existingSuperAdmin.email);
      process.exit(0);
    }

    // Create super admin
    const superAdmin = await User.create({
      email: 'superadmin@zuna-xosokeno.com',
      phone: '0123456789',
      password: 'superadmin123',
      fullName: 'Super Administrator',
      role: 'super_admin',
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      balance: 0
    });

    console.log('✅ Super admin created successfully!');
    console.log('📧 Email:', superAdmin.email);
    console.log('🔑 Password: superadmin123');
    console.log('👤 Role:', superAdmin.role);
    console.log('📱 Phone:', superAdmin.phone);

    // Create regular admin
    const admin = await User.create({
      email: 'admin@zuna-xosokeno.com',
      phone: '0987654321',
      password: 'admin123',
      fullName: 'Administrator',
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      balance: 0
    });

    console.log('\n✅ Regular admin created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: admin123');
    console.log('👤 Role:', admin.role);
    console.log('📱 Phone:', admin.phone);

    console.log('\n🎉 All admin accounts created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Super Admin: superadmin@zuna-xosokeno.com / superadmin123');
    console.log('Admin: admin@zuna-xosokeno.com / admin123');

  } catch (error) {
    console.error('❌ Error creating admin accounts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
createSuperAdmin();





