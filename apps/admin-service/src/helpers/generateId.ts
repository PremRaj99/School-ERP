export function generateId(role: "Student" | "Teacher", serialNumber: number) {
    // 1. Determine the prefix based on the role
    const prefix = role.toUpperCase().startsWith('STU') ? 'STU' : 'TCH';

    // 2. Get the current year
    const year = new Date().getFullYear(); // This will be 2025

    // 3. Format the serial number with leading zeros (e.g., 1 -> "0001")
    const formattedSerialNumber = String(serialNumber).padStart(4, '0');

    // 4. Combine the parts into the final ID
    return `${prefix}${year}${formattedSerialNumber}`;
}