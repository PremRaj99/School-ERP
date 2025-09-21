"use client";
import { BreadcrumbResponsive } from "@/components/custom/BreadCrum";
import { Alert, AlertTitle } from "@/components/ui/alert";
import StudentAcademicService from "@/services/student/academic";
import StudentNoticeService from "@/services/student/notice";
import { useQuery } from "@tanstack/react-query";

export default function page() {
  const items = [
    {
      href: "/student",
      label: "Student",
    },
    {
      label: "Notice And Calendar",
    },
  ];

  const {
    data: noticeData,
    error: noticeError,
    isPending: noticeIsPending,
  } = useQuery({
    queryKey: ["notice"],
    queryFn: () => StudentNoticeService.notice(),
  });
  const {
    data: calendarData,
    error: calendarError,
    isPending: calendarIsPending,
  } = useQuery({
    queryKey: ["calendar"],
    queryFn: () => StudentAcademicService.calendar(),
  });

  if (noticeIsPending || calendarIsPending) {
    return <>Loading...</>;
  }

  if (noticeError || calendarError) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-red-500">
          Failed to load page data. Please try again later.
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center container mx-auto gap-4 my-10">
      <BreadcrumbResponsive items={items} />
      {/* notice */}
      <div className="flex flex-col gap-4">
        <div className="text-3xl font-bold text-center tracking-wide text-black dark:text-white">
          Notice
        </div>
        <div className="max-w-xl w-xl flex flex-col items-center justify-center gap-2">
          {noticeData as {id: string, date: string, title: string, targetRole: string}[] ? noticeData.data.map((notice: {id: string, date: string, title: string, targetRole: string}) => (
            <Alert className="flex w-full justify-between" key={notice.id} variant="default">
              <AlertTitle className="">{notice.title}</AlertTitle>
              <div className="text-xs font-light text-nowrap">
                {new Date(notice.date).toDateString()}
              </div>
            </Alert>
          )) : <p>No Notice Found</p>}
        </div>
      </div>
      {/* calendar */}
      <div className="flex flex-col gap-4">
        <div className="text-3xl font-bold text-center tracking-wide text-black dark:text-white">
          Calendar
        </div>
        <div className="max-w-xl w-xl flex flex-col items-center justify-center gap-2">
          {calendarData as {id: string, date: string, title: string, category: string, targetRole: string}[] ? calendarData.data.map((c: {id: string, date: string, category: string, title: string, targetRole: string}) => (
            <Alert key={c.id} className="flex w-full justify-between" variant="default">
            <AlertTitle className="">{c.title}</AlertTitle>
            <div className="text-xs font-light text-nowrap">
              {c.category}
            </div>
            <div className="text-xs font-light text-nowrap">
              {new Date(c.date).toDateString()}
            </div>
          </Alert>
          )) : <p>No Calendar Found</p>}
        </div>
      </div>
    </div>
  );
}
