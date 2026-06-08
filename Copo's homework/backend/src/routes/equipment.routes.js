import { Router } from 'express';
import equipmentController from '../controllers/equipment.controller.js';
import upload from '../utils/multer.util.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/')
    .post(authMiddleware, upload.single('image'), equipmentController.create)
    .get(authMiddleware, equipmentController.getAll);

router.route('/:id')
    .get(authMiddleware, equipmentController.getById)
    .put(authMiddleware, upload.single('image'), equipmentController.update)
    .delete(authMiddleware, equipmentController.delete);

export default router;
