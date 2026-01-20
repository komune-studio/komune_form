import { Router } from 'express';
import * as controller from '../../controllers/authController';

const router = Router();

router.get('/validate', controller.validateToken);

export default router;