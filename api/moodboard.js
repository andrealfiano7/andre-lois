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
      const items = await prisma.moodboardItem.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return res.status(200).json({ success: true, data: items });
    }

    if (req.method === 'POST') {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (Array.isArray(data)) {
        for (const item of data) {
          if (!item.id || !item.imageUrl) continue;
          await prisma.moodboardItem.upsert({
            where: { id: item.id },
            update: {
              title: item.title,
              categoryId: item.categoryId,
              subCategoryId: item.subCategoryId,
              imageUrl: item.imageUrl,
              videoUrl: item.videoUrl || '',
              mediaType: item.mediaType || 'image',
              notes: item.notes || '',
              source: item.source || ''
            },
            create: {
              id: item.id,
              title: item.title,
              categoryId: item.categoryId,
              subCategoryId: item.subCategoryId,
              imageUrl: item.imageUrl,
              videoUrl: item.videoUrl || '',
              mediaType: item.mediaType || 'image',
              notes: item.notes || '',
              source: item.source || '',
              createdAt: item.createdAt || new Date().toISOString().split('T')[0]
            }
          });
        }
        return res.status(200).json({ success: true, message: 'Batch moodboard items updated' });
      }

      if (!data?.id || !data?.imageUrl) {
        return res.status(400).json({ success: false, error: 'Item id and imageUrl are required' });
      }

      const newItem = await prisma.moodboardItem.upsert({
        where: { id: data.id },
        update: {
          title: data.title,
          categoryId: data.categoryId,
          subCategoryId: data.subCategoryId,
          imageUrl: data.imageUrl,
          videoUrl: data.videoUrl || '',
          mediaType: data.mediaType || 'image',
          notes: data.notes || '',
          source: data.source || ''
        },
        create: {
          id: data.id,
          title: data.title,
          categoryId: data.categoryId,
          subCategoryId: data.subCategoryId,
          imageUrl: data.imageUrl,
          videoUrl: data.videoUrl || '',
          mediaType: data.mediaType || 'image',
          notes: data.notes || '',
          source: data.source || '',
          createdAt: data.createdAt || new Date().toISOString().split('T')[0]
        }
      });
      return res.status(201).json({ success: true, data: newItem });
    }

    if (req.method === 'PUT') {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, ...updateData } = data;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Moodboard ID is required' });
      }

      const updated = await prisma.moodboardItem.update({
        where: { id },
        data: updateData
      });
      return res.status(200).json({ success: true, data: updated });
    }

    if (req.method === 'DELETE') {
      const id = req.query?.id || (typeof req.body === 'string' ? JSON.parse(req.body)?.id : req.body?.id);
      if (!id) {
        return res.status(400).json({ success: false, error: 'Moodboard ID is required' });
      }

      await prisma.moodboardItem.delete({
        where: { id }
      });
      return res.status(200).json({ success: true, message: 'Moodboard item deleted' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('API /api/moodboard error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
