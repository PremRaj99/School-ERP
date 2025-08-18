export const getGrade = (fullMarks: number, marksObtained: number): string => {
    // Handle invalid inputs to prevent division by zero or incorrect calculations
    if (fullMarks <= 0 || marksObtained < 0) {
        return "N/A";
    }

    const percentage = (marksObtained / fullMarks) * 100;

    // Determine the grade based on the percentage.
    // This scale can be easily customized to fit your needs.
    if (percentage >= 90) {
        return "A+";
    } else if (percentage >= 80) {
        return "A";
    } else if (percentage >= 70) {
        return "B";
    } else if (percentage >= 60) {
        return "C";
    } else if (percentage >= 50) {
        return "D";
    } else if (percentage >= 40) {
        return "E";
    } else {
        return "F";
    }
};