import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppLayout } from './app-layout';
import { PublicLayout } from './public-layout';

export const PublicRouteWrapper: React.FC = () => (
  <PublicLayout>
    <Outlet />
  </PublicLayout>
);

export const AdminRouteWrapper: React.FC = () => (
  <AppLayout role="admin">
    <Outlet />
  </AppLayout>
);

export const TeacherRouteWrapper: React.FC = () => (
  <AppLayout role="teacher">
    <Outlet />
  </AppLayout>
);

export const StudentRouteWrapper: React.FC = () => (
  <AppLayout role="student">
    <Outlet />
  </AppLayout>
);
