import { Router } from 'express';
import recordController from '../controllers/record.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/')
    .post(authMiddleware, recordController.create)
    .get(authMiddleware, recordController.getAll);

router.route('/:id')
    .get(authMiddleware, recordController.getById)
    .put(authMiddleware, recordController.update)
    .delete(authMiddleware, recordController.delete);

export default router;
