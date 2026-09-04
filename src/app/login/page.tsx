"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Snowflake, BookOpen, Shield, ArrowRight, Loader2, User, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('role') === 'admin' ? 'admin' : 'student';
  const { login } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'student' | 'admin'>(defaultTab as 'student' | 'admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Missing fields', description: 'Please fill in both email and password.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast({ title: 'Welcome back!', description: `Logged in successfully as ${activeTab}.` });
        if (activeTab === 'admin') {
          router.push('/admin');
        } else {
          router.push('/student');
        }
      } else {
        toast({ title: 'Login failed', description: res.error || 'Invalid email or password', variant: 'destructive' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoStudent = () => {
    setEmail('rahul.sharma@tmsl.edu');
    setPassword('student123');
    setActiveTab('student');
  };

  const fillDemoAdmin = () => {
    setEmail('omjee@tmsl.edu');
    setPassword('Omjee@123');
    setActiveTab('admin');
  };

  return (
    <Card className="border-border shadow-lg">
      <CardHeader className="pb-4">
        <Tabs value={activeTab} onValueChange={(val) => {
          setActiveTab(val as 'student' | 'admin');
          setEmail('');
          setPassword('');
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Student Panel
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin Panel
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={activeTab === 'admin' ? 'admin@tmsl.edu' : 'student@tmsl.edu'}
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <div className="relative">
              <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Demo quick credential helper buttons */}
          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Quick Demo Credentials:
            </p>
            <div className="flex gap-2">
              {activeTab === 'student' ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fillDemoStudent}
                  className="text-xs w-full text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40"
                >
                  Fill Student Demo (Rahul)
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fillDemoAdmin}
                  className="text-xs w-full text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/40"
                >
                  Use Admin Login (Omjee)
                </Button>
              )}
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
                Signing in...
              </>
            ) : (
              <>
                Sign In to {activeTab === 'admin' ? 'Admin Panel' : 'Student Panel'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          {activeTab === 'student' && (
            <p className="text-center text-xs text-muted-foreground">
              New student?{' '}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Create your account here
              </Link>
            </p>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-950/50">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-2">
            <Snowflake className="h-8 w-8 text-[#29B5E8]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Portal Sign In</h1>
          <p className="text-sm text-muted-foreground">
            Access your personalized TMSL AI knowledge workspace
          </p>
        </div>

        <Suspense fallback={
          <div className="p-8 text-center bg-card rounded-xl border">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground mt-2">Loading sign in...</p>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
