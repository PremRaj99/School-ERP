import { BreadcrumbResponsive } from "@/components/custom/BreadCrum";
import React from "react";

export default function page() {
  const items = [
    {
      href: "/student",
      label: "Student",
    },
    {
      label: "Attendnce",
    },
  ];
  return (
    <div className="flex flex-col items-center justify-center container mx-auto gap-4 my-10">
      <BreadcrumbResponsive items={items} />
    </div>
  );
}
