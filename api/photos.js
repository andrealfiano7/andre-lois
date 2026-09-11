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
      const photos = await prisma.guestPhoto.findMany({
        orderBy: { createdAt: 'asc' }
      });
      return res.status(200).json({ success: true, data: photos });
    }

    if (req.method === 'POST') {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      // Support batch upsert or single create
      if (Array.isArray(data)) {
        for (const item of data) {
          await prisma.guestPhoto.upsert({
            where: { id: item.id },
            update: {
              status: item.status,
              note: item.note,
              name: item.name,
              category: item.category,
              side: item.side,
              detail: item.detail
            },
            create: item
          });
        }
        return res.status(200).json({ success: true, message: 'Batch photos updated' });
      }

      const newPhoto = await prisma.guestPhoto.create({
        data
      });
      return res.status(201).json({ success: true, data: newPhoto });
    }

    if (req.method === 'PUT') {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, ...updateData } = data;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Photo ID is required' });
      }

      const updated = await prisma.guestPhoto.update({
        where: { id },
        data: updateData
      });
      return res.status(200).json({ success: true, data: updated });
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id || (typeof req.body === 'string' ? JSON.parse(req.body)?.id : req.body?.id);
      if (!id) {
        return res.status(400).json({ success: false, error: 'Photo ID is required' });
      }

      await prisma.guestPhoto.delete({
        where: { id }
      });
      return res.status(200).json({ success: true, message: 'Photo deleted' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('API /api/photos error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
