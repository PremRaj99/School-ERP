export function generateSubjectCode(subjectName: string) {

  const baseCode = subjectName.replace(/\s+/g, '').substring(0, 3).toUpperCase();

  const randomNumber = Math.floor(Math.random() * 1000);
  
  const randomSuffix = String(randomNumber).padStart(3, '0');

  return `${baseCode}${randomSuffix}`;
}