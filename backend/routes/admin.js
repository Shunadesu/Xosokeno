import express from 'express';
import { 
  getAdminDashboard,
  getUsers,
  getUserById,
  createAdmin,
  updateUser,
  deleteUser,
  getAdminStats,
  getSystemLogs,
  getAdminSettings,
  updateAdminSettings
} from '../controllers/adminController.js';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/validation.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// Routes
router.get('/dashboard', getAdminDashboard);
router.get('/stats', getAdminStats);
router.get('/settings', getAdminSettings);
router.put('/settings', updateAdminSettings);
router.get('/logs', getSystemLogs);

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', requireSuperAdmin, createAdmin);
router.put('/users/:id', updateUser);
router.delete('/users/:id', requireSuperAdmin, deleteUser);

export default router;

