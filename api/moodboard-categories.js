import { prisma } from './_lib/prisma.js';

export default async function handler(req, res) {
  // CORS & Strict Anti-Caching Headers (Eliminates HTTP 304)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
      const setting = await prisma.appSetting.findUnique({
        where: { key: 'moodboard_categories' }
      });
      if (setting && setting.value) {
        try {
          const parsed = JSON.parse(setting.value);
          return res.status(200).json({ success: true, data: parsed });
        } catch {
          return res.status(200).json({ success: true, data: null });
        }
      }
      return res.status(200).json({ success: true, data: null });
    }

    if (req.method === 'POST') {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!Array.isArray(data)) {
        return res.status(400).json({ success: false, error: 'Expected an array of categories' });
      }

      await prisma.appSetting.upsert({
        where: { key: 'moodboard_categories' },
        update: { value: JSON.stringify(data) },
        create: { key: 'moodboard_categories', value: JSON.stringify(data) }
      });

      return res.status(200).json({ success: true, message: 'Moodboard categories saved to cloud' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('API /api/moodboard-categories error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
