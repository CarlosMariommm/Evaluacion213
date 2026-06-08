import { Router } from 'express';
import specialtyController from '../controllers/specialty.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/')
    .post(authMiddleware, specialtyController.create)
    .get(authMiddleware, specialtyController.getAll);

router.route('/:id')
    .get(authMiddleware, specialtyController.getById)
    .put(authMiddleware, specialtyController.update)
    .delete(authMiddleware, specialtyController.delete);

export default router;
