import { BreadcrumbResponsive } from "@/components/custom/BreadCrum";
import React from "react";

export default function page() {
  const items = [
    {
      label: "Admin Dashboard",
    },
  ];
  return (
    <div className="container mx-auto gap-6 my-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <BreadcrumbResponsive items={items} />
      </div>
    </div>
  );
}
