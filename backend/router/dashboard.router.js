import express from 'express';
import { auth } from '../middleware/auth.middleware.js';
import { 
    getUserDashboard,
    updateDashboard,
    getDashboardData,
    addWidget,
    removeWidget
} from '../controllers/dashboard.controllers.js';

const router = express.Router();

// Áp dụng middleware auth cho tất cả các route
router.use(auth);

// Dashboard routes
router.get('/', getUserDashboard);
router.get('/data', getDashboardData);
router.put('/', updateDashboard);
router.post('/widgets', addWidget);
router.delete('/widgets/:widgetId', removeWidget);

export default router;