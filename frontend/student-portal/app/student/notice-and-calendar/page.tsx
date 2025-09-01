import { BreadcrumbResponsive } from "@/components/custom/BreadCrum";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import React from "react";

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
  return (
    <div className="flex flex-col items-center justify-center container mx-auto gap-4 my-10">
      <BreadcrumbResponsive items={items} />
      <div className="flex flex-col gap-4">
        <div className="text-3xl font-bold text-center tracking-wide text-black dark:text-white">
          Weekly Schedule
        </div>
        <div className="max-w-xl w-xl flex flex-col items-center justify-center gap-2">
          <Alert className="flex w-full justify-between" variant="default">
            <AlertTitle className="">Heads up!</AlertTitle>
            <div className="text-xs font-light text-nowrap">
              {new Date().toDateString()}
            </div>
          </Alert>
          <Alert className="flex w-full justify-between" variant="default">
            <AlertTitle className="">Heads up!</AlertTitle>
            <div className="text-xs font-light text-nowrap">
              {new Date().toDateString()}
            </div>
          </Alert>
          <Alert className="flex w-full justify-between" variant="default">
            <AlertTitle className="">Heads up!</AlertTitle>
            <div className="text-xs font-light text-nowrap">
              {new Date().toDateString()}
            </div>
          </Alert>
          <Alert className="flex w-full justify-between" variant="default">
            <AlertTitle className="">Heads up!</AlertTitle>
            <div className="text-xs font-light text-nowrap">
              {new Date().toDateString()}
            </div>
          </Alert>
        </div>
      </div>
    </div>
  );
}
