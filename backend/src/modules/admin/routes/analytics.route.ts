import { Router } from 'express';
import {
  getAcademics,
  getAttendance,
  getFinance,
  getOverview,
  getStaff,
} from '../controllers/analytics.controller';

export const analyticsRouter = Router();

analyticsRouter.get('/overview', getOverview);
analyticsRouter.get('/attendance', getAttendance);
analyticsRouter.get('/academics', getAcademics);
analyticsRouter.get('/finance', getFinance);
analyticsRouter.get('/staff', getStaff);
