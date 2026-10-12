import React from 'react';
import type { ReportCardSet, ReportCardStudent } from '@schoolerp/contracts';
import { SCHOOL_NAME } from '@/lib/finance-format';
import { isoToDisplayDate } from '@/lib/date';
import { cn } from '@/lib/utils';

interface ReportCardProps {
  set: ReportCardSet;
  student: ReportCardStudent;
  className?: string;
}

const RESULT_CLASS: Record<ReportCardStudent['result'], string> = {
  Pass: 'text-emerald-700',
  Fail: 'text-rose-700',
  Incomplete: 'text-amber-700',
};

const fullName = (s: { firstName: string; lastName: string | null }) =>
  `${s.firstName} ${s.lastName ?? ''}`.trim();

/**
 * One printable report card (sized for an A4 page). Always rendered as "paper" — white background,
 * dark text — in both themes, so what's on screen is what prints.
 */
export const ReportCard = React.forwardRef<HTMLDivElement, ReportCardProps>(
  ({ set, student, className }, ref) => {
    const { exam, subjects } = set;
    const info: [string, React.ReactNode][] = [
      ['Student Name', fullName(student)],
      ['Class & Section', `${exam.className} - ${exam.section}`],
      ['Roll No.', student.rollNo],
      ['Student ID', <span className="font-mono">{student.studentId}</span>],
      ["Father's Name", student.fatherName || '—'],
      ["Mother's Name", student.motherName || '—'],
      ['Date of Birth', student.dob ? isoToDisplayDate(student.dob) : '—'],
      ['Session', exam.session],
    ];

    return (
      <div
        ref={ref}
        className={cn(
          'relative mx-auto w-full max-w-[210mm] rounded-md border border-slate-300 bg-white p-8 text-[12px] text-slate-900 shadow-sm print:rounded-none print:border-0 print:shadow-none',
          className,
        )}
      >
        {!exam.isResultDecleared && (
          <p className="mb-3 rounded border border-amber-300 bg-amber-50 px-3 py-1.5 text-center text-[11px] font-semibold text-amber-800">
            PROVISIONAL — results for this exam have not been published yet.
          </p>
        )}

        {/* Letterhead */}
        <div className="border-b-2 border-slate-800 pb-3 text-center">
          <h2 className="text-xl font-extrabold tracking-tight uppercase">{SCHOOL_NAME}</h2>
          <p className="mt-1 text-sm font-bold tracking-wide">REPORT CARD</p>
          <p className="text-[11px] text-slate-600">
            {exam.title} · {isoToDisplayDate(exam.dateFrom)}
            {exam.dateTo && exam.dateTo !== exam.dateFrom && ` – ${isoToDisplayDate(exam.dateTo)}`}
          </p>
        </div>

        {/* Student details */}
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5">
          {info.map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <dt className="w-28 shrink-0 text-slate-500">{label}</dt>
              <dd className="font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {/* Marks */}
        <table className="mt-5 w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-100">
              {['Subject', 'Max Marks', 'Marks Obtained', 'Grade', 'Remarks'].map((h, i) => (
                <th
                  key={h}
                  className={cn(
                    'border border-slate-300 px-2 py-1.5 font-bold',
                    i > 0 && i < 4 && 'text-center',
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject, i) => {
              const mark = student.marks[i];
              return (
                <tr key={subject.subjectCode}>
                  <td className="border border-slate-300 px-2 py-1.5 font-medium">
                    {subject.subjectName}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-center">
                    {subject.fullMarks}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-center font-semibold">
                    {mark?.marksObtained ?? <span className="text-slate-400">AB</span>}
                  </td>
                  <td
                    className={cn(
                      'border border-slate-300 px-2 py-1.5 text-center font-bold',
                      mark?.grade === 'F' && 'text-rose-700',
                    )}
                  >
                    {mark?.grade ?? '—'}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-slate-600">
                    {mark?.remark || ''}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-slate-50 font-bold">
              <td className="border border-slate-300 px-2 py-1.5">Total</td>
              <td className="border border-slate-300 px-2 py-1.5 text-center">
                {student.totalFull}
              </td>
              <td className="border border-slate-300 px-2 py-1.5 text-center">
                {student.totalObtained}
              </td>
              <td className="border border-slate-300 px-2 py-1.5 text-center">{student.grade}</td>
              <td className="border border-slate-300 px-2 py-1.5" />
            </tr>
          </tbody>
        </table>

        {/* Summary */}
        <div className="mt-4 grid grid-cols-4 divide-x divide-slate-300 rounded border border-slate-300 text-center">
          {[
            ['Percentage', `${student.percentage}%`],
            ['Overall Grade', student.grade],
            ['Rank', student.rank ? `${student.rank} of ${set.classStrength}` : '—'],
            [
              'Result',
              <span className={RESULT_CLASS[student.result]}>{student.result.toUpperCase()}</span>,
            ],
          ].map(([label, value]) => (
            <div key={label as string} className="px-2 py-2">
              <p className="text-[10px] text-slate-500 uppercase">{label}</p>
              <p className="text-sm font-extrabold">{value}</p>
            </div>
          ))}
        </div>

        {/* Attendance */}
        <p className="mt-4">
          <span className="font-bold">Attendance: </span>
          {student.attendance.workingDays > 0 ? (
            <>
              present {student.attendance.present} of {student.attendance.workingDays} working days
              ({student.attendance.percent}%)
              {student.attendance.leave > 0 && `, ${student.attendance.leave} on leave`}
            </>
          ) : (
            'not recorded'
          )}
          <span className="text-slate-500">
            {' '}
            · {isoToDisplayDate(set.attendanceFrom)} to {isoToDisplayDate(set.attendanceTo)}
          </span>
        </p>

        {/* Remarks */}
        <div className="mt-5">
          <p className="font-bold">Class Teacher&apos;s Remarks</p>
          <div className="mt-6 border-b border-dotted border-slate-400" />
          <div className="mt-6 border-b border-dotted border-slate-400" />
        </div>

        {/* Signatures */}
        <div className="mt-14 grid grid-cols-3 gap-6 text-center text-[11px]">
          {['Class Teacher', 'Principal', 'Parent / Guardian'].map((who) => (
            <div key={who} className="border-t border-slate-500 pt-1 font-semibold">
              {who}
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-[10px] text-slate-400">
          Grades: A+ 90–100 · A 80–89 · B+ 70–79 · B 60–69 · C 50–59 · D 33–49 · F below 33 · AB =
          absent
        </p>
      </div>
    );
  },
);
ReportCard.displayName = 'ReportCard';
