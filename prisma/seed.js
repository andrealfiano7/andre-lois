import { PrismaClient } from '@prisma/client';
import { INITIAL_TASKS } from '../src/data/initialTasks.js';
import { INITIAL_PHOTO_LIST, INITIAL_RUNDOWN } from '../src/data/otherSheets.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai seeding data ke Neon PostgreSQL...');

  // 1. Seed Tasks
  console.log(`📦 Seeding ${INITIAL_TASKS.length} tasks...`);
  for (const task of INITIAL_TASKS) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {
        sheetNo: String(task.sheetNo || ''),
        category: task.category,
        title: task.title,
        pic: task.pic,
        rawDate: task.rawDate || null,
        dueDate: task.dueDate || null,
        progress: task.progress || 0,
        status: task.status || 'Not yet Started',
        vendorContact: task.vendorContact || null,
        notes: task.notes || null
      },
      create: {
        id: task.id,
        sheetNo: String(task.sheetNo || ''),
        category: task.category,
        title: task.title,
        pic: task.pic,
        rawDate: task.rawDate || null,
        dueDate: task.dueDate || null,
        progress: task.progress || 0,
        status: task.status || 'Not yet Started',
        vendorContact: task.vendorContact || null,
        notes: task.notes || null
      }
    });
  }

  // 2. Seed Guest Photos
  console.log(`📸 Seeding ${INITIAL_PHOTO_LIST.length} guest photo items...`);
  for (const item of INITIAL_PHOTO_LIST) {
    await prisma.guestPhoto.upsert({
      where: { id: item.id },
      update: {
        side: item.side || null,
        category: item.category,
        name: item.name,
        detail: item.detail || null,
        status: item.status || 'Menunggu',
        note: item.note || null
      },
      create: {
        id: item.id,
        side: item.side || null,
        category: item.category,
        name: item.name,
        detail: item.detail || null,
        status: item.status || 'Menunggu',
        note: item.note || null
      }
    });
  }

  // 3. Seed Rundown Items
  console.log(`⏱️ Clearing and seeding ${INITIAL_RUNDOWN.length} real rundown items...`);
  await prisma.rundownItem.deleteMany({});
  for (const item of INITIAL_RUNDOWN) {
    await prisma.rundownItem.upsert({
      where: { id: item.id },
      update: {
        time: item.time,
        duration: item.duration || null,
        phase: item.phase || null,
        activity: item.activity,
        pic: item.pic,
        status: item.status || 'Upcoming',
        note: item.note || null
      },
      create: {
        id: item.id,
        time: item.time,
        duration: item.duration || null,
        phase: item.phase || null,
        activity: item.activity,
        pic: item.pic,
        status: item.status || 'Upcoming',
        note: item.note || null
      }
    });
  }

  console.log('✅ Seeding berhasil! Seluruh data tersimpan di Neon PostgreSQL.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
