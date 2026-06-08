import { Router } from 'express';
import patientController from '../controllers/patient.controller.js';
import upload from '../utils/multer.util.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas de autenticación y registro
router.post('/register', upload.single('profilePhoto'), patientController.register);
router.post('/verify-email', patientController.verifyEmail);
router.post('/login', patientController.login);
router.post('/logout', patientController.logout);
router.post('/forgot-password', patientController.forgotPassword);
router.post('/reset-password', patientController.resetPassword);

// Rutas CRUD protegidas (encadenadas con .route() según reglas)
router.route('/')
    .get(authMiddleware, patientController.getAll);

router.route('/:id')
    .get(authMiddleware, patientController.getById)
    .put(authMiddleware, upload.single('profilePhoto'), patientController.update)
    .delete(authMiddleware, patientController.delete);

export default router;
