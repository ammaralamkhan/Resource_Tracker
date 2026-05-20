// ================================================================
// Faculty Routes — /api/faculty
// ================================================================
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorizeRole';
import * as facultyController from '../controllers/facultyController';

const router = Router();

// ─── Multer Storage Config ────────────────────────────────────
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'materials');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
  fileFilter: (_req, file, cb) => {
    // Allow common document and presentation formats
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/png',
      'image/jpeg',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Upload PDF, Word, PowerPoint, Excel, or image files.'));
    }
  },
});

// ─── All routes require authentication ───────────────────────
router.use(authenticate);

// ─── Materials ────────────────────────────────────────────────
router.get('/materials', facultyController.getMaterials);
router.post(
  '/materials',
  authorizeRole('faculty', 'admin', 'chairman'),
  upload.single('file'),
  facultyController.uploadMaterial
);
router.delete('/materials/:id', facultyController.deleteMaterial);

// ─── Location Status ──────────────────────────────────────────
router.get('/status', facultyController.getAllStatuses);
router.patch(
  '/status',
  authorizeRole('faculty', 'admin', 'chairman'),
  facultyController.updateStatus
);

export default router;
