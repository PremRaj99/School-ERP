import React from "react";
import Image from "next/image";
import { User, GraduationCap, Hash } from "lucide-react";

export default function Profile() {
  const data = {
    profilePicture: "https://cdn-icons-png.flaticon.com/512/2886/2886011.png",
    firstName: "Prem",
    lastName: "Raj",
    className: "04",
    section: "A",
    rollNo: 4,
    studentId: "STU2025001",
  };

  return (
    <div className="max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl dark:hover:shadow-2xl transition-shadow duration-300">
      {/* Header section with subtle accent */}
      <div className="bg-slate-50 dark:bg-gray-700/50 px-6 pt-6 pb-4">
        <div className="flex items-center gap-4">
          {/* Profile Picture */}
          <div className="relative">
            <Image
              src={data.profilePicture || "https://cdn-icons-png.flaticon.com/512/2886/2886011.png"}
              alt="Profile Picture"
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 dark:bg-green-400 rounded-full border-2 border-white dark:border-gray-600"></div>
          </div>

          {/* Name and ID */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
              {data.firstName} {data.lastName}
            </h2>
            <div className="flex items-center gap-1 mt-1">
              <Hash size={14} className="text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300 font-mono">{data.studentId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Information */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Class */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <GraduationCap size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Class</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{data.className}-{data.section}</p>
            </div>
          </div>

          {/* Roll Number */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="p-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
              <User size={16} className="text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Roll No</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{data.rollNo}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileImageSkeleton() {
  return (
    <div className="max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="bg-slate-50 dark:bg-gray-700/50 px-6 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse w-24"></div>
          </div>
        </div>
      </div>
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}