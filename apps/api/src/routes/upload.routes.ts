import { Router } from 'express';
import multer from 'multer';
import { verifyJWT } from '../middleware/auth';
import { BadRequestError } from '../utils/errors';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Only JPEG, PNG, WebP, and GIF images are allowed'));
    }
  },
});

const router = Router();

router.post('/', verifyJWT, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }

    const file = req.file;
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.mimetype.split('/')[1]}`;

    // In production, upload to S3/GCS/Cloudflare R2 and return the URL
    // For now, return file metadata with a placeholder URL
    res.json({
      success: true,
      data: {
        url: `/uploads/${filename}`,
        filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as uploadRoutes };
