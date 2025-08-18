export const getMonthStartEnd = (monthString: string) => {
    const [month, year] = monthString.split('-').map(Number);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    return { startDate, endDate }
}