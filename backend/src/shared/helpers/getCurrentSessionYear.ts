export const getCurrentSessionYear = (): string => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    let sessionStartYear: number;

    if (currentMonth >= 4) {
        sessionStartYear = currentYear;
    } else {
        sessionStartYear = currentYear - 1;
    }

    const sessionEndYear = sessionStartYear + 1;
    return `${sessionStartYear}-${sessionEndYear}`;
};
