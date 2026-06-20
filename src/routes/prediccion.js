import express from 'express';
import controller from '../controllers/prediccion.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

const bloquearAdmin = (req, res, next) => {
    if (req.usuario?.rol === 'admin') {
        return res.status(403).json({
            success: false,
            message: 'El administrador no realiza predicciones.'
        });
    }
    next();
};

router.get('/', controller.listarMias);
router.get('/partido/:partidoId', controller.obtenerParaPartido);
router.post('/', bloquearAdmin, controller.guardar);
router.delete('/:id', bloquearAdmin, controller.eliminar);

export default router;
