// RankedTag in-browser image compressor (no native deps, no sharp).
// Decodes the file, downscales on a <canvas>, and re-encodes to WebP,
// stepping quality down until it fits a target size. Returns a base64
// data URL ready to POST to the upload endpoint.

const DEFAULTS = {
  maxDim: 1600,        // longest edge cap (hero/full-bleed)
  targetBytes: 320_000, // aim for ≤ ~320 KB
  minQuality: 0.5,
  startQuality: 0.85,
};

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')); };
    img.src = url;
  });
}

function canvasToBlob(canvas, type, q) {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, q));
}

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

/**
 * @param {File} file  original image file
 * @param {object} opts overrides for DEFAULTS
 * @returns {{dataUrl,bytes,width,height,type}}
 */
export async function compressImage(file, opts = {}) {
  const cfg = { ...DEFAULTS, ...opts };
  if (!file || !file.type?.startsWith('image/')) {
    throw new Error('Not an image file');
  }

  const img = await loadImage(file);
  let { width, height } = img;

  // Scale so the longest edge ≤ maxDim (never upscale).
  const scale = Math.min(1, cfg.maxDim / Math.max(width, height));
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  // WebP, walking quality down until we hit the size target.
  let quality = cfg.startQuality;
  let blob = await canvasToBlob(canvas, 'image/webp', quality);
  // Some browsers ignore WebP — fall back to JPEG.
  const type = blob && blob.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
  if (type === 'image/jpeg') {
    blob = await canvasToBlob(canvas, 'image/jpeg', quality);
  }
  while (blob && blob.size > cfg.targetBytes && quality > cfg.minQuality) {
    quality = Math.max(cfg.minQuality, quality - 0.1);
    blob = await canvasToBlob(canvas, type, quality);
  }
  if (!blob) throw new Error('Image encoding failed in this browser');

  const dataUrl = await blobToDataURL(blob);
  return { dataUrl, bytes: blob.size, width, height, type };
}
