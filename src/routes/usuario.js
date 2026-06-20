import express from 'express';
import usuarioController from '../controllers/usuario.js';
import authMiddleware, { adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/registrar', usuarioController.registrar);
router.post('/login', usuarioController.login);
router.get('/usuarios', authMiddleware, adminMiddleware, usuarioController.listarUsuarios);

export default router;
