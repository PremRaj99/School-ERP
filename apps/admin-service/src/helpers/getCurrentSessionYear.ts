import { SESSION_START_MONTH } from "../controllers/subject.controller";

export const getCurrentSessionYear = () => {
    // 1. Determine the current academic session string
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    let sessionYearFrom;
    if (currentMonth >= SESSION_START_MONTH) {
        sessionYearFrom = currentYear;
    } else {
        sessionYearFrom = currentYear - 1;
    }
    const currentSessionString = `${sessionYearFrom}-${sessionYearFrom + 1}`; // eg: , "2024-2025"
    return currentSessionString;
}