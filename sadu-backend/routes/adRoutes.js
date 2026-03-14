import express from 'express';
import {
  getAds,
  getAd,
  getAdsByType,
  getAdsByCategory,
  createAd,
  updateAd,
  deleteAd
} from '../controllers/adController.js';
import protect from '../middleware/authMiddleware.js';
import upload from '../config/multer.js';

const router = express.Router();

// Public routes
router.get('/', getAds);
router.get('/type/:type', getAdsByType);
router.get('/category/:categoryId', getAdsByCategory);
router.get('/:id', getAd);

// Admin only routes
router.post('/', protect, upload.single('image'), createAd);
router.put('/:id', protect, upload.single('image'), updateAd);
router.delete('/:id', protect, deleteAd);

export default router;