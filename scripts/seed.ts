import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import bcrypt from 'bcryptjs';
import { connectDb } from '../lib/server/db';
import { User } from '../lib/server/models/User';

async function seed() {
  try {
    console.log('Connecting to database...');
    await connectDb();
    console.log('Connected.');

    const email = 'admin@example.com';
    const password = 'Admin12345!';
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.findOneAndUpdate(
      { email },
      {
        fullName: 'System Administrator',
        email,
        passwordHash,
        role: 'admin',
      },
      { upsert: true, new: true }
    );

    console.log('Admin user seeded successfully:');
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${user.role}`);
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
