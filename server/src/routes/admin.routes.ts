import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getAdminDashboard, getUsers, getUserById, updateUser, deleteUser,
  verifyUser, getAuditLogs, getSystemHealth, getDrives,
  createAnnouncement, getAnalytics,
} from '../controllers/admin.controller';

const router = Router();
router.use(authenticate, authorize('admin', 'placement_officer'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', authorize('admin'), deleteUser);
router.put('/users/:id/verify', verifyUser);
router.get('/audit-logs', authorize('admin'), getAuditLogs);
router.get('/system-health', authorize('admin'), getSystemHealth);
router.get('/drives', getDrives);
router.post('/announcements', createAnnouncement);
router.get('/analytics', getAnalytics);

export default router;
