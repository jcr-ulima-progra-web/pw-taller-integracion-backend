import express from 'express';
import controller from '../controllers/partido.js';

const router = express.Router();

router.get('/',controller.findAll);
router.get('/:id',controller.findOne);

export default router;
