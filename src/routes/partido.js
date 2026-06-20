import express from 'express';
import controller from '../controllers/partido.js';
import authMiddleware, { adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', controller.findAll);
router.get('/:id', controller.findOne);
router.put('/:id/marcador', authMiddleware, adminMiddleware, controller.setMarcadorReal);

export default router;
