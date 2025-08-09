
type input = {
    class: {
        className: string,
        section: string,
    },
    teacher: {
        teacherId: string,
        firstName: string,
        lastName: string | null,
    },
    weekday: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT",
    subject: {
        subjectName: string,
        subjectCode: string,
    },
    period: number
}[]

type output = {
    className: string,
    section: string,
    timetable:
    {
        weekday: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT",
        subjects:
        {
            period: number,
            subject: string,
            subjectCode: string,
            teacherName: string,
            teacherId: string
        }[]
    }[]
}[]


export const timeTableFormattedData = (timeTable: input): output => {
    const classMap = new Map<string, {
        className: string,
        section: string,
        timetable: {
            weekday: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT",
            subjects: {
                period: number,
                subject: string,
                subjectCode: string,
                teacherName: string,
                teacherId: string
            }[]
        }[]
    }>();

    // Define the order for sorting weekdays
    const weekdayOrder = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

    timeTable.forEach(entry => {
        // Create a unique key for each class, e.g., "03-A"
        const classKey = `${entry.class.className}-${entry.class.section}`;

        // If we haven't seen this class before, create its main object
        if (!classMap.has(classKey)) {
            classMap.set(classKey, {
                className: entry.class.className,
                section: entry.class.section,
                timetable: [],
            });
        }

        // Get the object for the current class
        const currentClass = classMap.get(classKey);

        if (!currentClass) {
            // Should not happen, but TypeScript requires this check
            return;
        }

        // Find the entry for the current weekday within that class's timetable
        let weekdayEntry = currentClass.timetable.find(day => day.weekday === entry.weekday);

        // If we haven't seen this weekday for this class, create it
        if (!weekdayEntry) {
            weekdayEntry = {
                weekday: entry.weekday,
                subjects: [],
            };
            currentClass.timetable.push(weekdayEntry);
        }

        // Add the specific subject and teacher details for the period
        weekdayEntry.subjects.push({
            period: entry.period,
            subject: entry.subject.subjectName,
            subjectCode: entry.subject.subjectCode,
            teacherName: `${entry.teacher.firstName} ${entry.teacher.lastName || ''}`.trim(),
            teacherId: entry.teacher.teacherId,
        });
    });

    // Convert the map of classes into a final array
    const finalTimeTable = Array.from(classMap.values());

    // --- Final Sorting (Optional, but recommended for consistent order) ---
    finalTimeTable.forEach(cls => {
        // Sort the weekdays (Mon, Tue, Wed...)
        cls.timetable.sort((a, b) => weekdayOrder.indexOf(a.weekday) - weekdayOrder.indexOf(b.weekday));

        // For each day, sort the subjects by period number (1, 2, 3...)
        cls.timetable.forEach(day => {
            day.subjects.sort((a, b) => a.period - b.period);
        });
    });

    return finalTimeTable
}