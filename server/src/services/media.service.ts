import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 150 * 1024 * 1024, // 150MB max for HD 4K iPhone videos and large documents
  },
});

/**
 * Detect media type including native iOS/iPhone formats:
 * - Images: JPEG, PNG, WEBP, GIF, HEIC, HEIF
 * - Videos: MP4, MOV (Apple QuickTime), MKV, AVI, WEBM
 * - Audio: M4A (Apple Voice Memo), MP3, OGG, WAV, AAC
 * - Documents: PDF, DOCX, XLSX, PPTX, TXT, ZIP
 */
export function detectMediaType(mimeType: string, filename?: string): 'image' | 'video' | 'audio' | 'document' {
  const mime = (mimeType || '').toLowerCase();
  const ext = filename ? path.extname(filename).toLowerCase() : '';

  // Images
  if (
    mime.startsWith('image/') ||
    ['.heic', '.heif', '.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)
  ) {
    return 'image';
  }

  // Videos (including iPhone .mov QuickTime)
  if (
    mime.startsWith('video/') ||
    mime === 'video/quicktime' ||
    ['.mov', '.mp4', '.mkv', '.webm', '.m4v'].includes(ext)
  ) {
    return 'video';
  }

  // Audio (including Apple .m4a Voice Memos)
  if (
    mime.startsWith('audio/') ||
    mime === 'audio/x-m4a' ||
    mime === 'audio/m4a' ||
    ['.m4a', '.mp3', '.ogg', '.wav', '.aac'].includes(ext)
  ) {
    return 'audio';
  }

  return 'document';
}
