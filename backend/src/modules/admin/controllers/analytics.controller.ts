import { adminAnalyticsContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminAnalyticsService } from '../services/analytics.service';

export const getOverview = defineRoute(adminAnalyticsContract.overview, async ({ query }) => {
  return AdminAnalyticsService.getOverview(query.session);
});

export const getAttendance = defineRoute(adminAnalyticsContract.attendance, async ({ query }) => {
  return AdminAnalyticsService.getAttendance(query.from, query.to, query.className, query.section);
});

export const getAcademics = defineRoute(adminAnalyticsContract.academics, async ({ query }) => {
  return AdminAnalyticsService.getAcademics(query.examId);
});

export const getFinance = defineRoute(adminAnalyticsContract.finance, async ({ query }) => {
  return AdminAnalyticsService.getFinance(query.session);
});

export const getStaff = defineRoute(adminAnalyticsContract.staff, async ({ query }) => {
  return AdminAnalyticsService.getStaff(query.month);
});
