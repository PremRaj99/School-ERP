"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  DollarSign,
  Clock,
  FileText,
  Bell,
  User,
  Settings,
} from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { title: "Attendance", link: "/student/attendance", icon: Calendar },
    { title: "Fee", link: "/student/fee", icon: DollarSign },
    { title: "Time Table", link: "/student/time-table", icon: Clock },
    { title: "Exam & Results", link: "/student/exam-and-results", icon: FileText },
    { title: "Notice & Calendar", link: "/student/notice-and-calendar", icon: Bell },
    { title: "Profile", link: "/student/profile", icon: User },
    { title: "Setting", link: "/student/setting", icon: Settings },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav>
      <ul className="flex flex-wrap items-center justify-center gap-6 p-4">
        {links.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.link);

          return (
            <li key={item.link}>
              <Link href={item.link}>
                <div
                  className={`flex flex-col justify-center items-center gap-2 min-w-32 w-full h-28 rounded-xl border transition-all duration-200 cursor-pointer group
                  ${
                    active
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <IconComponent
                    size={36}
                    className={`transition-transform duration-200 ${
                      active ? "scale-110" : "group-hover:scale-105"
                    }`}
                  />
                  <span className="text-sm font-medium text-center">{item.title}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
