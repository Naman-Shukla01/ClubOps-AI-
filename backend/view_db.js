import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from './config/db.js';
import Task from './models/Task.js';
import User from './models/User.js';
import Event from './models/Event.js';
import Risk from './models/Risk.js';
import Meeting from './models/Meeting.js';

async function displayDatabaseContents() {
  await connectDatabase();
  console.log('\n=============================================================');
  console.log('                 CLUBOPS AI DATABASE VIEWER                  ');
  console.log('=============================================================\n');

  // 1. Tasks
  const tasks = await Task.find().populate('owner', 'name email').populate('event', 'name').sort({ createdAt: -1 });
  console.log(`📋 TASKS (${tasks.length} total):`);
  if (tasks.length === 0) {
    console.log('   (No tasks found)');
  } else {
    console.table(
      tasks.map((t) => ({
        ID: t._id.toString().slice(-6),
        Title: t.title.length > 35 ? t.title.slice(0, 32) + '...' : t.title,
        Status: t.status,
        Priority: t.priority,
        Assignee: t.owner?.name || 'Unassigned',
        Deadline: t.deadline ? new Date(t.deadline).toLocaleDateString() : 'None',
        Source: t.source || 'manual'
      }))
    );
  }

  // 2. Users / Volunteers
  const users = await User.find().sort({ createdAt: -1 });
  console.log(`\n👤 USERS & VOLUNTEERS (${users.length} total):`);
  console.table(
    users.map((u) => ({
      ID: u._id.toString().slice(-6),
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Status: u.status
    }))
  );

  // 3. Events
  const events = await Event.find().sort({ createdAt: -1 });
  console.log(`\n🎉 EVENTS (${events.length} total):`);
  console.table(
    events.map((e) => ({
      ID: e._id.toString().slice(-6),
      Name: e.name,
      Status: e.status,
      Location: e.location || 'N/A',
      StartDate: e.startDate ? new Date(e.startDate).toLocaleDateString() : 'N/A'
    }))
  );

  // 4. Risks
  const risks = await Risk.find().sort({ createdAt: -1 });
  console.log(`\n⚠️ RISKS (${risks.length} total):`);
  if (risks.length === 0) {
    console.log('   (No risks logged)');
  } else {
    console.table(
      risks.map((r) => ({
        ID: r._id.toString().slice(-6),
        Title: r.title,
        Severity: r.severity,
        Status: r.status,
        Type: r.type
      }))
    );
  }

  console.log('\n=============================================================\n');
  await mongoose.disconnect();
  process.exit(0);
}

displayDatabaseContents().catch((err) => {
  console.error('Error connecting to database:', err.message);
  process.exit(1);
});
