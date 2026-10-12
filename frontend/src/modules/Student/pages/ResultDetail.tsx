import React, { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/data-table';
import { ReportCard } from '@/components/report-card/ReportCard';
import { studentService } from '@/lib/services/student.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { printElement } from '@/lib/print';
import { PiArrowLeft, PiPrinter } from 'react-icons/pi';
import { useQuery } from '@tanstack/react-query';

export const StudentResultDetail: React.FC = () => {
  const { examId = '' } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: qk.student.reportCard(examId),
    queryFn: () => studentService.getReportCard(examId),
    enabled: !!examId,
  });

  const backButton = (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 text-xs"
      onClick={() => navigate('/student/exams')}
    >
      <PiArrowLeft className="mr-1.5 h-3.5 w-3.5" />
      Back to Examinations
    </Button>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-[40rem] w-full" />
      </div>
    );
  }

  const student = data?.students[0];
  if (isError || !data || !student) {
    return (
      <div className="space-y-6">
        {backButton}
        <ErrorState
          title={isError ? undefined : 'Result not available'}
          description={
            isError
              ? getErrorMessage(error)
              : 'This result has not been declared yet, or does not exist.'
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        {backButton}
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 h-9 gap-1.5 text-xs text-white"
          onClick={() => printElement(cardRef.current, `Report Card - ${data.exam.title}`)}
        >
          <PiPrinter className="h-3.5 w-3.5" />
          <span>Print Report Card</span>
        </Button>
      </div>

      <ReportCard ref={cardRef} set={data} student={student} />
    </div>
  );
};

export default StudentResultDetail;
