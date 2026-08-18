import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    if (query.includes('student')) navigate('/admin/students');
    else if (query.includes('teacher')) navigate('/admin/teachers');
    else if (query.includes('exam')) navigate('/admin/exams');
    else if (query.includes('fee') || query.includes('finance')) navigate('/admin/finance');
    else if (query.includes('notice')) navigate('/admin/notices');
    else if (query.includes('contact')) navigate('/contact');
    else navigate('/auth/login');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-8 p-6">
      <div className="max-w-xl space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">School ERP Management System</h1>
        <p className="text-muted-foreground text-sm">
          Comprehensive enterprise portal for Administrators, Teachers, and Students.
        </p>
      </div>

      <Card className="w-full max-w-xl shadow-md">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick Portal Navigation</CardTitle>
          <CardDescription>
            Search for ERP modules or jump straight to your role's portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search modules (e.g. students, exams, fees)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit">Search</Button>
          </form>

          <div className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-4">
            <Button variant="outline" onClick={() => navigate('/auth/login')}>
              Login
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
              Admin Portal
            </Button>
            <Button variant="outline" onClick={() => navigate('/teacher/dashboard')}>
              Teacher Portal
            </Button>
            <Button variant="outline" onClick={() => navigate('/student/dashboard')}>
              Student Portal
            </Button>
          </div>
          <div className="pt-2">
            <Button variant="secondary" className="w-full" onClick={() => navigate('/contact')}>
              Public Contact Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
