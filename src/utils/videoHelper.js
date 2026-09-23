// Helper to parse, validate and extract metadata from video URLs (YouTube, Vimeo, MP4, etc.)
// Hak Cipta: Andre & Lois

export function parseVideoUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // 1. YouTube (standard, short, embed, shorts)
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const ytMatch = trimmed.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      platform: 'YouTube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      originalUrl: trimmed
    };
  }

  // 2. Vimeo
  const vimeoRegex = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+))/i;
  const vimeoMatch = trimmed.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[3]) {
    const videoId = vimeoMatch[3];
    return {
      type: 'vimeo',
      platform: 'Vimeo',
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1`,
      thumbnailUrl: null,
      originalUrl: trimmed
    };
  }

  // 3. Direct video file (mp4, webm, ogg, mov)
  if (trimmed.match(/\.(mp4|webm|ogg|mov)($|\?)/i)) {
    return {
      type: 'direct',
      platform: 'Direct Video',
      videoId: null,
      embedUrl: trimmed,
      thumbnailUrl: null,
      originalUrl: trimmed
    };
  }

  return null;
}

export function isVideoUrl(url) {
  return Boolean(parseVideoUrl(url));
}
