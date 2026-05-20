// ================================================================
// Faculty Controller — study materials upload & location status
// ================================================================
import { Request, Response, NextFunction } from 'express';
import pool from '../config/db';
import fs from 'fs';
import path from 'path';

// ─── Study Materials ─────────────────────────────────────────

/** POST /api/faculty/materials — upload a study material (faculty only) */
export async function uploadMaterial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded.' });
      return;
    }

    const { title, subject, description } = req.body;
    if (!title?.trim()) {
      // Remove the orphaned file
      fs.unlinkSync(req.file.path);
      res.status(400).json({ success: false, message: 'Title is required.' });
      return;
    }

    const { rows } = await pool.query(
      `INSERT INTO faculty_materials
         (uploaded_by, title, subject, description, file_name, file_path, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user!.user_id,
        title.trim(),
        subject?.trim() || null,
        description?.trim() || null,
        req.file.originalname,
        req.file.path,
        req.file.size,
        req.file.mimetype,
      ]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

/** GET /api/faculty/materials — list all materials (all authenticated users) */
export async function getMaterials(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { rows } = await pool.query(
      `SELECT
         m.*,
         u.name AS uploader_name,
         u.email AS uploader_email
       FROM faculty_materials m
       JOIN users u ON u.user_id = m.uploaded_by
       WHERE u.is_active = TRUE
       ORDER BY m.uploaded_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/faculty/materials/:id — delete own material (or admin/chairman) */
export async function deleteMaterial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const { rows } = await pool.query(
      'SELECT * FROM faculty_materials WHERE material_id = $1',
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Material not found.' });
      return;
    }

    const material = rows[0];
    const isOwner = material.uploaded_by === user.user_id;
    const isAdminOrAbove = user.role === 'admin' || user.role === 'chairman';

    if (!isOwner && !isAdminOrAbove) {
      res.status(403).json({ success: false, message: 'You can only delete your own materials.' });
      return;
    }

    // Delete file from disk
    if (fs.existsSync(material.file_path)) {
      fs.unlinkSync(material.file_path);
    }

    await pool.query('DELETE FROM faculty_materials WHERE material_id = $1', [id]);
    res.json({ success: true, message: 'Material deleted.' });
  } catch (err) {
    next(err);
  }
}

// ─── Location Status ─────────────────────────────────────────

/** PATCH /api/faculty/status — upsert the logged-in faculty's location status */
export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.body;
    const validStatuses = ['in_department', 'in_classroom', 'outside'];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status value.' });
      return;
    }

    const { rows } = await pool.query(
      `INSERT INTO faculty_location_status (user_id, status, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()
       RETURNING *`,
      [req.user!.user_id, status]
    );

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}

/** GET /api/faculty/status — get all faculty members with their current location status */
export async function getAllStatuses(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { rows } = await pool.query(
      `SELECT
         u.user_id,
         u.name,
         u.email,
         u.profile_picture,
         COALESCE(fls.status, 'outside') AS status,
         fls.updated_at
       FROM users u
       JOIN roles r ON r.role_id = u.role_id
       LEFT JOIN faculty_location_status fls ON fls.user_id = u.user_id
       WHERE r.role_name = 'faculty' AND u.is_active = TRUE
       ORDER BY u.name ASC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}
