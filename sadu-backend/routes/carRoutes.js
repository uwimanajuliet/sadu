// ── carRoutes.js ──
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCars, getAvailableCars, getCar, createCar, updateCar, deleteCar } from '../controllers/carController.js';
import protect from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

const router = express.Router();

router.get('/',            getCars);
router.get('/available',   getAvailableCars);
router.get('/:id',         getCar);
router.post('/',           protect, upload.single('image'), createCar);
router.put('/:id',         protect, upload.single('image'), updateCar);
router.delete('/:id',      protect, deleteCar);

export default router;
