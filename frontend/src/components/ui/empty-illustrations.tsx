import React from 'react';
import { cn } from '@/lib/utils';

export type EmptyStateVariant =
  | 'users'
  | 'students'
  | 'teachers'
  | 'faculty'
  | 'classes'
  | 'subjects'
  | 'books'
  | 'attendance'
  | 'studentAttendance'
  | 'exams'
  | 'results'
  | 'fees'
  | 'finance'
  | 'salaries'
  | 'timetable'
  | 'calendar'
  | 'notices'
  | 'announcements'
  | 'search'
  | 'general';

const EMPTY_STATE_IMAGES: Record<EmptyStateVariant, string> = {
  attendance: '/empty-state-attendance.jpg',
  studentAttendance: '/empty-state-student-attendance.jpg',
  exams: '/empty-state-exams.jpg',
  results: '/empty-state-exams.jpg',
  fees: '/empty-state-fees.jpg',
  finance: '/empty-state-fees.jpg',
  salaries: '/empty-state-fees.jpg',
  notices: '/empty-state-notices.jpg',
  announcements: '/empty-state-notices.jpg',
  search: '/empty-state-search.jpg',
  general: '/empty-state-search.jpg',
  timetable: '/empty-state-timetable.jpg',
  calendar: '/empty-state-calendar.jpg',
  subjects: '/empty-state-subjects.jpg',
  classes: '/empty-state-subjects.jpg',
  books: '/empty-state-subjects.jpg',
  teachers: '/empty-state-teachers.jpg',
  faculty: '/empty-state-teachers.jpg',
  users: '/empty-state-users.jpg',
  students: '/empty-state-users.jpg',
};

export interface EmptyIllustrationProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  variant?: EmptyStateVariant;
  size?: number | string;
  className?: string;
}

export const EmptyIllustration: React.FC<EmptyIllustrationProps> = ({
  variant = 'general',
  size = 120,
  className,
  alt,
  style,
  ...props
}) => {
  const imgSrc = EMPTY_STATE_IMAGES[variant] || '/empty-state-search.jpg';
  const dimension = typeof size === 'number' ? `${size}px` : size;

  return (
    <img
      src={imgSrc}
      alt={alt || `${variant} empty state illustration`}
      style={{
        width: dimension,
        height: dimension,
        ...style,
      }}
      className={cn(
        'shrink-0 object-contain mix-blend-multiply drop-shadow-xs transition-transform duration-200 dark:mix-blend-screen dark:hue-rotate-180 dark:invert',
        className,
      )}
      loading="lazy"
      {...props}
    />
  );
};

export default EmptyIllustration;
