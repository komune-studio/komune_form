import { Router } from 'express';
import * as controller from '../../controllers/visitorController';
import auth from '../../middlewares/auth';

const router = Router();

// Public routes
router.get('/stats', controller.getVisitorStats);

// Protected routes (require authentication)
router.post('/create', auth.auth, controller.createVisitor);
router.get('/all', auth.auth, controller.getAllVisitors);
router.get('/search', auth.auth, controller.searchVisitors);
router.get('/phone', auth.auth, controller.getVisitorByPhone);
router.get('/recent-active', auth.auth, controller.getRecentActiveVisitors);
router.get('/:id', auth.auth, controller.getVisitorById);
router.put('/:id', auth.auth, controller.updateVisitor);
router.post('/:id/checkout', auth.auth, controller.checkOutVisitor);
router.delete('/:id', auth.auth, controller.deleteVisitor);

export default router;