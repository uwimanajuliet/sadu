import express from 'express';
import { register, login } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// test protected route
router.get('/me', protect, (req, res) => {
  res.json({ message: 'You are authenticated', admin: req.admin });
});

export default router;