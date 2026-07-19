export const getDateString = (date: string) => {
    const [day, month, year] = date.split('-').map(Number);
    const parsedDate = new Date(Date.UTC(year!, month! - 1, day!));
    return parsedDate;
};
