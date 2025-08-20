export const getDateString = (date: string) => {
    // date is in format of DD-MM-YYYY
    // generate for storing in date format
    const [day, month, year] = date.split('-').map(Number);
    // Create a Date object (months are 0-indexed in JS)
    const jsDate = new Date(year, month - 1, day);
    return jsDate;
}