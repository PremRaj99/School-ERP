export const getGrade = (fullMarks: number, marksObtained: number): string => {
  if (fullMarks <= 0) {
    throw new Error('Full marks must be greater than zero.');
  }

  const percentage = (marksObtained / fullMarks) * 100;

  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 33) return 'D';
  return 'F';
};
