"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Loader2, Shield, User, Building, Calendar } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const DEPARTMENTS = [
  { value: 'Computer Science & Engineering', label: 'Computer Science & Engineering (CSE)' },
  { value: 'Information Technology', label: 'Information Technology (IT)' },
  { value: 'Electronics & Communication', label: 'Electronics & Communication (ECE)' },
  { value: 'Electrical Engineering', label: 'Electrical Engineering (EE)' },
  { value: 'Mechanical Engineering', label: 'Mechanical Engineering (ME)' },
  { value: 'Civil Engineering', label: 'Civil Engineering (CE)' },
  { value: 'AI & Machine Learning', label: 'AI & Machine Learning (AIML)' },
  { value: 'Data Science', label: 'Data Science (DS)' },
  { value: 'Computer Applications (MCA/BCA)', label: 'Computer Applications (MCA / BCA)' },
  { value: 'Applied Sciences & Humanities', label: 'Applied Sciences & Humanities' },
];

const STUDY_YEARS = [
  { value: '1st Year', label: '1st Year (1st & 2nd Semester)' },
  { value: '2nd Year', label: '2nd Year (3rd & 4th Semester)' },
  { value: '3rd Year', label: '3rd Year (5th & 6th Semester)' },
  { value: '4th Year', label: '4th Year (7th & 8th Semester)' },
  { value: 'Post Graduate (M.Tech/MCA/PhD)', label: 'Post Graduate (M.Tech / MCA / Ph.D)' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({ title: 'Name Required', description: 'Please provide your full name.', variant: 'destructive' });
      return;
    }

    if (!email.trim() || !password) {
      toast({ title: 'Missing credentials', description: 'Please provide both email and password.', variant: 'destructive' });
      return;
    }

    if (password.length < 4) {
      toast({ title: 'Weak Password', description: 'Password should be at least 4 characters.', variant: 'destructive' });
      return;
    }

    if (!department) {
      toast({ title: 'Department Required', description: 'Please select your department.', variant: 'destructive' });
      return;
    }

    if (!year) {
      toast({ title: 'Year Required', description: 'Please select your year of study.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        department,
        year,
      });

      if (res.success) {
        toast({ title: 'Account Created! 🎉', description: 'You are now signed in to the Student Portal.' });
        router.push('/student');
      } else {
        toast({ title: 'Registration Failed', description: res.error || 'Unable to register account', variant: 'destructive' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-950/50">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-100 text-[#29B5E8] dark:bg-blue-950/50 mb-1">
            <BookOpen className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Student Registration</h1>
          <p className="text-sm text-muted-foreground">
            Create your official student account to access institutional notices, events, and AI
          </p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle>Create Student Account</CardTitle>
            <CardDescription>
              All fields marked with (<span className="text-destructive font-semibold">*</span>) are mandatory.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="e.g. Rahul Sharma"
                    className="pl-9"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="email">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@tmsl.edu or your email"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password (min 4 characters)"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <Label htmlFor="department">
                  Department / Stream <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Select value={department} onValueChange={setDepartment} required>
                    <SelectTrigger id="department" className="w-full">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                        <SelectValue placeholder="Select your department" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Year of Study */}
              <div className="space-y-1.5">
                <Label htmlFor="year">
                  Year of Study <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Select value={year} onValueChange={setYear} required>
                    <SelectTrigger id="year" className="w-full">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        <SelectValue placeholder="Select your year of study" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {STUDY_YEARS.map((yr) => (
                        <SelectItem key={yr.value} value={yr.value}>
                          {yr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-2">
              <Button
                type="submit"
                className="w-full bg-[#29B5E8] hover:bg-[#29B5E8]/90 text-white font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Complete Registration & Enter Portal
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Already registered?{' '}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Sign in here
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
