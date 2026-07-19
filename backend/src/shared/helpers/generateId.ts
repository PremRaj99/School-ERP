export const generateId = (role: "Student" | "Teacher" | "Admin", serialNumber: number) => {
    let prefix: string;
    switch (role) {
        case "Student":
            prefix = "STU";
            break;
        case "Teacher":
            prefix = "TCH";
            break;
        case "Admin":
            prefix = "ADM";
            break;
        default:
            throw new Error("Invalid role provided for ID generation");
    }

    const paddedSerial = String(serialNumber).padStart(8, '0');
    return `${prefix}${paddedSerial}`;
};
