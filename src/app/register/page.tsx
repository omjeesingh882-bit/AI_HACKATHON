"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Loader2, Shield, User, Building, Layers } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Missing fields', description: 'Please provide both email and password.', variant: 'destructive' });
      return;
    }

    if (password.length < 4) {
      toast({ title: 'Weak Password', description: 'Password should be at least 4 characters.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        email,
        password,
        name: name.trim() || undefined,
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-950/50">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-100 text-[#29B5E8] dark:bg-blue-950/50 mb-2">
            <BookOpen className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Student Sign Up</h1>
          <p className="text-sm text-muted-foreground">
            Create your personal student account with your email and password
          </p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle>Create Student Account</CardTitle>
            <CardDescription>
              Sign up to view official notices, campus events, and use the AI assistant.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@tmsl.edu or personal email"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password (min 4 characters)"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name (Optional)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="e.g. Rahul Sharma (optional)"
                    className="pl-9"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
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
                    Sign Up & Enter Student Portal
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{' '}
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
