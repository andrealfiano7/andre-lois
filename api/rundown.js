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
      const items = await prisma.rundownItem.findMany({
        orderBy: { createdAt: 'asc' }
      });
      return res.status(200).json({ success: true, data: items });
    }

    if (req.method === 'POST') {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (Array.isArray(data)) {
        for (const item of data) {
          await prisma.rundownItem.upsert({
            where: { id: item.id },
            update: {
              status: item.status,
              note: item.note,
              time: item.time,
              activity: item.activity,
              pic: item.pic,
              phase: item.phase,
              duration: item.duration
            },
            create: item
          });
        }
        return res.status(200).json({ success: true, message: 'Batch rundown updated' });
      }

      const newItem = await prisma.rundownItem.create({
        data
      });
      return res.status(201).json({ success: true, data: newItem });
    }

    if (req.method === 'PUT') {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, ...updateData } = data;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Rundown ID is required' });
      }

      const updated = await prisma.rundownItem.update({
        where: { id },
        data: updateData
      });
      return res.status(200).json({ success: true, data: updated });
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id || (typeof req.body === 'string' ? JSON.parse(req.body)?.id : req.body?.id);
      if (!id) {
        return res.status(400).json({ success: false, error: 'Rundown ID is required' });
      }

      await prisma.rundownItem.delete({
        where: { id }
      });
      return res.status(200).json({ success: true, message: 'Rundown item deleted' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('API /api/rundown error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
