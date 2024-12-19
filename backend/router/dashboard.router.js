import express from 'express';
import {
    getUserDashboard,
    updateDashboard,
    getDashboardData,
    addWidget,
    removeWidget
} from '../controllers/dashboard.controllers.js';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

// Tất cả các routes đều cần xác thực
router.use(protectRoute);

// Routes cho dashboard
router.get("/", getUserDashboard);
router.get("/data", getDashboardData);
router.patch("/update", updateDashboard);
router.post("/widgets", addWidget);
router.delete("/widgets/:widgetId", removeWidget);

export default router;