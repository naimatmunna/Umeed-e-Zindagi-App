import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import roleRoutes from './role.routes.js';
import categoryRoutes from './category.routes.js';
import expenseRoutes from './expense.routes.js';
import attendanceRoutes from './attendance.routes.js';
import patientRoutes from './patient.routes.js';
import settingsRoutes from './settings.routes.js';
import healthRoutes from './health.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/categories', categoryRoutes);
router.use('/expenses', expenseRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/patients', patientRoutes);
router.use('/settings', settingsRoutes);

export default router;
