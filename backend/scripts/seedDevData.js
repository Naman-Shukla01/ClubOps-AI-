import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Task from '../models/Task.js';
import Meeting from '../models/Meeting.js';
import Document from '../models/Document.js';
import Risk from '../models/Risk.js';

async function seedData() {
  await connectDatabase();
  console.log('Seeding initial development data into MongoDB...');

  // 1. Seed Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await User.findOneAndUpdate(
    { email: 'admin@clubops.ai' },
    {
      $set: {
        name: 'Club Admin',
        email: 'admin@clubops.ai',
        passwordHash,
        role: 'ADMIN',
        status: 'active',
        skills: ['Management', 'Operations'],
        capacity: 100,
      }
    },
    { upsert: true, new: true, runValidators: true }
  );

  const clubHead = await User.findOneAndUpdate(
    { email: 'lead@clubops.ai' },
    {
      $set: {
        name: 'Arjun Mehta',
        email: 'lead@clubops.ai',
        passwordHash,
        role: 'EVENT_MANAGER',
        status: 'active',
        skills: ['Leadership', 'Event Planning'],
        capacity: 80,
      }
    },
    { upsert: true, new: true, runValidators: true }
  );

  const volunteer1 = await User.findOneAndUpdate(
    { email: 'sarah@clubops.ai' },
    {
      $set: {
        name: 'Sarah Chen',
        email: 'sarah@clubops.ai',
        passwordHash,
        role: 'VOLUNTEER',
        status: 'active',
        skills: ['Design', 'Marketing'],
        capacity: 40,
      }
    },
    { upsert: true, new: true, runValidators: true }
  );

  const volunteer2 = await User.findOneAndUpdate(
    { email: 'mike@clubops.ai' },
    {
      $set: {
        name: 'Mike Ross',
        email: 'mike@clubops.ai',
        passwordHash,
        role: 'VOLUNTEER',
        status: 'active',
        skills: ['Logistics', 'Public Speaking'],
        capacity: 60,
      }
    },
    { upsert: true, new: true, runValidators: true }
  );

  console.log('Seeded Users: Admin, Club Lead, Volunteers');

  // 2. Seed Main Event
  const mainEvent = await Event.findOneAndUpdate(
    { name: 'Tech Innovators Hackathon 2026' },
    {
      $set: {
        name: 'Tech Innovators Hackathon 2026',
        description: 'Annual 24-hour university hackathon exploring AI and cloud innovations.',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        location: 'Main University Auditorium & Innovation Lab',
        status: 'upcoming',
        createdBy: clubHead._id,
      }
    },
    { upsert: true, new: true, runValidators: true }
  );

  console.log(`Seeded Event: ${mainEvent.name} (${mainEvent._id})`);

  // 3. Seed Tasks
  const tasksData = [
    {
      title: 'Finalize Hackathon Venue & Catering Contract',
      description: 'Confirm booking with Auditorium manager and finalize catering headcount.',
      owner: clubHead._id,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      priority: 'high',
      status: 'in_progress',
      source: 'manual',
    },
    {
      title: 'Design Workshop & Hackathon Promotional Posters',
      description: 'Create social media graphics and printed posters for campus distribution.',
      owner: volunteer1._id,
      deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      priority: 'medium',
      status: 'todo',
      source: 'manual',
    },
    {
      title: 'Setup Audio & Sound Check for Opening Ceremony',
      description: 'Coordinate with AV team for mics, projector, and live stream setup.',
      owner: volunteer2._id,
      deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      priority: 'critical',
      status: 'todo',
      source: 'manual',
    },
  ];

  for (const t of tasksData) {
    await Task.findOneAndUpdate(
      { title: t.title, event: mainEvent._id },
      { $set: { ...t, event: mainEvent._id } },
      { upsert: true, new: true }
    );
  }
  console.log('Seeded Tasks');

  // 4. Seed Meeting
  const meeting = await Meeting.findOneAndUpdate(
    { title: 'Core Committee Kickoff Meeting', event: mainEvent._id },
    {
      $set: {
        event: mainEvent._id,
        title: 'Core Committee Kickoff Meeting',
        date: new Date(),
        rawTranscript: 'Discussed venue booking, posters design by Sarah, and sound check by Mike.',
        summary: 'Kickoff meeting setting key deadlines for the upcoming Hackathon.',
        decisions: ['Venue fixed at Main Auditorium', 'Posters due in 4 days'],
        actionItems: [
          { title: 'Design Posters', owner: 'Sarah Chen', priority: 'medium' },
          { title: 'Sound Check', owner: 'Mike Ross', priority: 'critical' },
        ],
      }
    },
    { upsert: true, new: true }
  );
  console.log(`Seeded Meeting: ${meeting.title}`);

  // 5. Seed Documents
  const documentsData = [
    {
      title: 'Hackathon Event Guidelines 2026.pdf',
      description: 'Official rules, track categories, and schedule for hackathon participants.',
      type: 'PDF',
      content: 'Rule 1: Teams of 2-4 members. Rule 2: All code must be written during the event.',
      uploadedBy: admin._id,
    },
    {
      title: 'Catering & Logistics Budget.xlsx',
      description: 'Itemized budget breakdown for meals, badges, and prizes.',
      type: 'XLSX',
      content: 'Catering: $1200, Prizes: $1500, Swag: $500',
      uploadedBy: clubHead._id,
    },
  ];

  for (const d of documentsData) {
    await Document.findOneAndUpdate(
      { title: d.title, event: mainEvent._id },
      { $set: { ...d, event: mainEvent._id } },
      { upsert: true, new: true }
    );
  }
  console.log('Seeded Documents');

  // 6. Seed Risks
  const risk = await Risk.findOneAndUpdate(
    { title: 'Catering Vendor Confirmation Delayed', event: mainEvent._id },
    {
      $set: {
        event: mainEvent._id,
        type: 'logistics',
        severity: 'high',
        title: 'Catering Vendor Confirmation Delayed',
        description: 'Vendor has not responded to dietary preference requirements.',
        sourceType: 'task',
        status: 'open',
      }
    },
    { upsert: true, new: true }
  );
  console.log(`Seeded Risk: ${risk.title}`);

  console.log('Database successfully seeded!');
}

seedData()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
