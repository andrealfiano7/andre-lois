import { prisma } from './_lib/prisma.js';

const DEPRECATED_TEMPLATE_IDS = ['mb-1', 'mb-2', 'mb-3', 'mb-4', 'mb-5', 'mb-6', 'mb-7', 'mb-8', 'mb-9'];

export default async function handler(req, res) {
  // CORS & Strict Anti-Caching Headers (Completely eliminates HTTP 304, forces fresh HTTP 200 on every request)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Pragma');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const items = await prisma.moodboardItem.findMany({
        where: {
          id: { notIn: DEPRECATED_TEMPLATE_IDS }
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.status(200).json({ success: true, data: items });
    }

    if (req.method === 'POST') {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (Array.isArray(data)) {
        // Filter out deprecated template items and invalid items
        const cleanData = data.filter(it => it?.id && it?.imageUrl && !DEPRECATED_TEMPLATE_IDS.includes(it.id));
        const incomingIds = cleanData.map(item => item.id).filter(Boolean);

        // Delete any items that are NOT in the incoming array, PLUS all deprecated template items!
        await prisma.moodboardItem.deleteMany({
          where: {
            OR: [
              { id: { notIn: incomingIds } },
              { id: { in: DEPRECATED_TEMPLATE_IDS } }
            ]
          }
        });

        if (cleanData.length > 0) {
          await prisma.moodboardItem.createMany({
            data: cleanData.map(item => ({
              id: item.id,
              title: item.title || '',
              categoryId: item.categoryId,
              subCategoryId: item.subCategoryId,
              imageUrl: item.imageUrl,
              videoUrl: item.videoUrl || '',
              mediaType: item.mediaType || 'image',
              notes: item.notes || '',
              source: item.source || '',
              createdAt: item.createdAt || new Date().toISOString().split('T')[0]
            })),
            skipDuplicates: true
          });
        }
        return res.status(200).json({ success: true, message: 'Batch moodboard items updated' });
      }

      if (!data?.id || !data?.imageUrl || DEPRECATED_TEMPLATE_IDS.includes(data.id)) {
        return res.status(400).json({ success: false, error: 'Valid item id and imageUrl are required' });
      }

      const newItem = await prisma.moodboardItem.upsert({
        where: { id: data.id },
        update: {
          title: data.title || '',
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
          title: data.title || '',
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
      let id = req.query?.id;
      if (!id && req.url) {
        try {
          const parsedUrl = new URL(req.url, 'http://localhost');
          id = parsedUrl.searchParams.get('id');
        } catch {}
      }
      if (!id && req.body) {
        try {
          const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
          id = body?.id;
        } catch {}
      }
      if (id) {
        try {
          id = decodeURIComponent(String(id)).trim();
        } catch {
          id = String(id).trim();
        }
      }
      if (!id) {
        return res.status(400).json({ success: false, error: 'Moodboard ID is required' });
      }

      const result = await prisma.moodboardItem.deleteMany({
        where: { id }
      });
      return res.status(200).json({ success: true, message: 'Moodboard item deleted', id, count: result.count });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('API /api/moodboard error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
