import { adminTimetableContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminTimetableService } from '../services/timetable.service';

export const getTimeTables = defineRoute(adminTimetableContract.get, async () => {
  return AdminTimetableService.getTimeTables();
});

export const updateTimeTable = defineRoute(adminTimetableContract.update, async ({ body }) => {
  return AdminTimetableService.updateTimeTable(body);
});
