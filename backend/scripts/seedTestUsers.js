import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import { ROLES } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const testUsers = [
  {
    key: 'ADMIN',
    email: process.env.TEST_ADMIN_EMAIL,
    password: process.env.TEST_ADMIN_PASSWORD,
    role: ROLES.ADMIN,
    name: 'DEV TEST ADMIN',
  },
  {
    key: 'EVENT_MANAGER',
    email: process.env.TEST_EVENT_MANAGER_EMAIL,
    password: process.env.TEST_EVENT_MANAGER_PASSWORD,
    role: ROLES.EVENT_MANAGER,
    name: 'DEV TEST EVENT MANAGER',
  },
  {
    key: 'VOLUNTEER',
    email: process.env.TEST_VOLUNTEER_EMAIL,
    password: process.env.TEST_VOLUNTEER_PASSWORD,
    role: ROLES.VOLUNTEER,
    name: 'DEV TEST VOLUNTEER',
  },
];

function validateConfiguration() {
  const missing = testUsers.flatMap(({ key, email, password }) => [
    email ? null : `TEST_${key}_EMAIL`,
    password ? null : `TEST_${key}_PASSWORD`,
  ]).filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Missing development test-user environment variables: ${missing.join(', ')}`);
  }

  const duplicateEmails = testUsers
    .map(({ email }) => email.trim().toLowerCase())
    .filter((email, index, emails) => emails.indexOf(email) !== index);
  if (duplicateEmails.length > 0) {
    throw new Error(`Test-user emails must be unique: ${[...new Set(duplicateEmails)].join(', ')}`);
  }

  for (const user of testUsers) {
    if (user.password.length < 8) {
      throw new Error(`${user.key} test password must be at least 8 characters`);
    }
  }
}

async function seedTestUsers() {
  validateConfiguration();
  await connectDatabase();

  for (const testUser of testUsers) {
    const email = testUser.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(testUser.password, 12);
    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name: testUser.name,
          email,
          passwordHash,
          role: testUser.role,
          status: 'active',
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    console.log(`Seeded ${email} with role ${testUser.role} (user ${user._id})`);
  }

  console.log('Development-only RBAC test users are ready. Log in normally through the application.');
}

try {
  await seedTestUsers();
} catch (error) {
  console.error(`Unable to seed development test users: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
