import { prisma } from './_lib/prisma.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const tasks = await prisma.task.findMany({
        orderBy: [
          { sheetNo: 'asc' },
          { createdAt: 'asc' }
        ]
      });
      return res.status(200).json({ success: true, data: tasks });
    }

    if (req.method === 'POST') {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const newTask = await prisma.task.create({
        data: {
          id: data.id || undefined,
          sheetNo: String(data.sheetNo || ''),
          category: data.category || 'A. Dealing Vendor',
          title: data.title,
          pic: data.pic || 'Bride & Groom',
          rawDate: data.rawDate || null,
          dueDate: data.dueDate || null,
          progress: Number(data.progress) || 0,
          status: data.status || 'Not yet Started',
          vendorContact: data.vendorContact || null,
          notes: data.notes || null
        }
      });
      return res.status(201).json({ success: true, data: newTask });
    }

    if (req.method === 'PUT') {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, ...updateData } = data;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Task ID is required for update' });
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          ...updateData,
          progress: updateData.progress !== undefined ? Number(updateData.progress) : undefined,
          sheetNo: updateData.sheetNo !== undefined ? String(updateData.sheetNo) : undefined
        }
      });
      return res.status(200).json({ success: true, data: updatedTask });
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id || (typeof req.body === 'string' ? JSON.parse(req.body)?.id : req.body?.id);
      if (!id) {
        return res.status(400).json({ success: false, error: 'Task ID is required for deletion' });
      }

      await prisma.task.delete({
        where: { id }
      });
      return res.status(200).json({ success: true, message: 'Task deleted successfully' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('API /api/tasks error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
