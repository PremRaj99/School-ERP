import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-8 p-6">
      <div className="max-w-xl space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">School ERP Management System</h1>
        <p className="text-muted-foreground text-sm">
          Comprehensive portal for Administrators, Teachers, and Students.
        </p>
      </div>

      <Card className="w-full max-w-xl shadow-md">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick Portal Search</CardTitle>
          <CardDescription>Search for modules, student IDs, or notices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search ERP modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="button">Search</Button>
          </div>

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
              Contact Us
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
