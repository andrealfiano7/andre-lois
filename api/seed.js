import { prisma } from './_lib/prisma.js';
import { INITIAL_TASKS } from '../src/data/initialTasks.js';
import { INITIAL_PHOTO_LIST, INITIAL_RUNDOWN } from '../src/data/otherSheets.js';

export default async function handler(req, res) {
  try {
    const taskCount = await prisma.task.count();
    if (taskCount > 0 && req.query?.force !== 'true') {
      return res.status(200).json({ 
        success: true, 
        message: 'Database already has data. Use ?force=true to reseed.',
        count: taskCount 
      });
    }

    // Seed tasks
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

    // Seed photos
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

    // Seed rundown
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

    return res.status(200).json({ 
      success: true, 
      message: 'Database successfully seeded!',
      tasks: INITIAL_TASKS.length,
      photos: INITIAL_PHOTO_LIST.length,
      rundown: INITIAL_RUNDOWN.length
    });
  } catch (error) {
    console.error('API /api/seed error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
