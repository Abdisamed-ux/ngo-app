import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getAssignedTasks, updateCaseStatus, getCaseDocuments, uploadCaseDocument } from './case-mgmt.controller.js';
import { requireAuth, requireRole } from '../../shared/middleware/rbac.middleware.js';

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Caseworker & Admin actions
router.get('/assigned', requireAuth, requireRole(['CASEWORKER', 'NGO_ADMIN']), getAssignedTasks);
router.patch('/:requestId/status', requireAuth, requireRole(['CASEWORKER', 'NGO_ADMIN', 'SUPER_ADMIN']), updateCaseStatus);

// Documents
router.get('/:requestId/documents', requireAuth, getCaseDocuments);
router.post('/:requestId/documents', requireAuth, requireRole(['CASEWORKER', 'NGO_ADMIN', 'SUPER_ADMIN']), upload.single('document'), uploadCaseDocument);

export default router;
