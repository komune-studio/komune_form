import { Router } from 'express';
import * as controller from '../../controllers/userController';
import auth from '../../middlewares/auth';

const router = Router();

router.post('/create/superadmin', controller.createSuperAdmin);
router.post('/create/admin', auth.superadmin, controller.createAdmin);
router.post('/login', controller.login);
router.get('/self', auth.admin_superadmin, controller.getSelfData);
router.get('/all', auth.admin_superadmin, controller.getAllUsers);
router.post('/reset-password', auth.admin_superadmin, controller.resetOwnPassword);
router.post('/reset-password/:userId', auth.superadmin, controller.resetUserPassword);
router.put('/profile', auth.admin_superadmin, controller.updateOwnProfile);
router.put('/profile/:userId', auth.superadmin, controller.updateProfile);
router.delete('/:userId', auth.superadmin, controller.softDeleteUser);
router.post('/restore/:userId', auth.superadmin, controller.restoreUser);
router.get('/all/inactive', auth.superadmin, controller.getAllUsersWithInactive);
export default router;