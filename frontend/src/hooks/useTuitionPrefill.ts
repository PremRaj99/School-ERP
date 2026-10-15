import { useEffect } from 'react';
import {
  useWatch,
  type Control,
  type UseFormGetValues,
  type UseFormSetValue,
} from 'react-hook-form';
import type { ClassFee, CreateStudentFeeBody, StudentRecord } from '@schoolerp/contracts';

/** The tuition line every Collect Fee form starts with. */
export const TUITION_FEE_TYPE = 'Tuition Fee';

/**
 * Keeps a Collect Fee form's tuition line at the selected student's class fee: whenever the
 * student changes (and once the student and class-fee lists have loaded), the "Tuition Fee"
 * row's amount is set to that class's monthly fee. Staff can still edit it afterwards.
 */
export function useTuitionPrefill({
  control,
  getValues,
  setValue,
  students,
  classFees,
}: {
  control: Control<CreateStudentFeeBody>;
  getValues: UseFormGetValues<CreateStudentFeeBody>;
  setValue: UseFormSetValue<CreateStudentFeeBody>;
  students: StudentRecord[] | undefined;
  classFees: ClassFee[] | undefined;
}) {
  const studentId = useWatch({ control, name: 'studentId' });
  const student = students?.find((s) => s.studentId === studentId);
  const fee = student
    ? classFees?.find(
        (c) =>
          c.className === student.className &&
          c.section === student.section &&
          c.session === student.session,
      )?.effectiveFee
    : undefined;

  useEffect(() => {
    if (fee === undefined) return;
    const index = getValues('feeBreakdown').findIndex((row) => row.feeType === TUITION_FEE_TYPE);
    if (index >= 0) setValue(`feeBreakdown.${index}.amount`, fee, { shouldDirty: true });
  }, [studentId, fee, getValues, setValue]);
}
