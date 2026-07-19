export const generateSubjectCode = (subjectName: string): string => {
  const letters = subjectName
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 3)
    .padEnd(3, 'X');

  const randomNumber = Math.floor(100 + Math.random() * 900);
  return `${letters}${randomNumber}`;
};
