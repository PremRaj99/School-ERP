
import { axios } from '@/utils/axios';
import { validateSchema } from '@repo/errorhandler';
import { CreatAacademicCalendarSchema, ObjectIdSchema, UpdateTimeTableSchema } from '@repo/types';

class AdminAcademicService {
    timeTable = async () => {

        const { data } = await axios.get("/admin/academic/time-table")
        return data;
    }

    updateTimeTable = async (formData: typeof UpdateTimeTableSchema) => {
        const parseData = validateSchema(UpdateTimeTableSchema, formData)

        const { data } = await axios.post(`/admin/academic/time-table`, parseData)
        return data;
    }

    calendar = async () => {

        const { data } = await axios.get("/admin/academic/calendar")
        return data;
    }

    createCalendar = async (formData: typeof CreatAacademicCalendarSchema) => {
        const parseData = validateSchema(CreatAacademicCalendarSchema, formData)

        const { data } = await axios.post(`/admin/academic/calendar`, parseData)
        return data;
    }

    deleteCalendar = async (calendarId: string) => {
        const id = validateSchema(ObjectIdSchema, calendarId)

        const { data } = await axios.delete(`/admin/academic/calendar/${id}`)
        return data;
    }
}

export default new AdminAcademicService();