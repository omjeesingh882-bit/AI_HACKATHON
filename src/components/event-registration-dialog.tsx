"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/auth-context';
import { EventData, TeamMember } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  User,
  Building,
  Phone,
  Calendar,
  Users,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
} from 'lucide-react';

interface EventRegistrationDialogProps {
  event: EventData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegistered?: () => void;
}

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'AI & Machine Learning',
  'Data Science',
  'Computer Applications (MCA/BCA)',
  'Applied Sciences & Humanities',
];

export function EventRegistrationDialog({
  event,
  open,
  onOpenChange,
  onRegistered,
}: EventRegistrationDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [email, setEmail] = useState('');

  // Group participation fields
  const [participationType, setParticipationType] = useState<'individual' | 'group'>('individual');
  const [groupName, setGroupName] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { name: '', rollNumber: '', email: '', phone: '', department: '' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill from logged-in user profile
  useEffect(() => {
    if (user && open) {
      setFullName(user.name || '');
      setEmail(user.email || '');
      setRollNumber(user.rollNumber || '');
      setDepartment(user.department || 'Computer Science & Engineering');
      setPhoneNumber('');
      setGender('');
      setParticipationType('individual');
      setGroupName('');
      setTeamMembers([{ name: '', rollNumber: '', email: '', phone: '', department: '' }]);
    }
  }, [user, open]);

  const handleAddMember = () => {
    if (teamMembers.length >= 5) {
      toast({
        title: 'Team Limit Reached',
        description: 'You can add up to 5 additional team members.',
      });
      return;
    }
    setTeamMembers((prev) => [
      ...prev,
      { name: '', rollNumber: '', email: '', phone: '', department: '' },
    ]);
  };

  const handleRemoveMember = (index: number) => {
    setTeamMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    setTeamMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!event) return;

    // Validation
    if (!fullName.trim()) {
      toast({ title: 'Full Name Required', description: 'Please enter your full name.', variant: 'destructive' });
      return;
    }
    if (!rollNumber.trim()) {
      toast({ title: 'Roll Number Required', description: 'Please enter your college roll number.', variant: 'destructive' });
      return;
    }
    if (!department) {
      toast({ title: 'Department Required', description: 'Please select your academic department.', variant: 'destructive' });
      return;
    }
    if (!phoneNumber.trim()) {
      toast({ title: 'Phone Number Required', description: 'Please enter a valid contact phone number.', variant: 'destructive' });
      return;
    }
    if (!gender) {
      toast({ title: 'Gender Required', description: 'Please select your gender.', variant: 'destructive' });
      return;
    }
    if (!email.trim()) {
      toast({ title: 'Email Required', description: 'Please enter your email address.', variant: 'destructive' });
      return;
    }

    if (participationType === 'group') {
      if (!groupName.trim()) {
        toast({ title: 'Group Name Required', description: 'Please provide your team / group name.', variant: 'destructive' });
        return;
      }
    }

    // Filter valid team members
    const validMembers = teamMembers.filter((m) => m.name.trim() && m.email.trim());

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/events/${event.event_id}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user?.id,
          full_name: fullName.trim(),
          roll_number: rollNumber.trim(),
          department,
          phone_number: phoneNumber.trim(),
          gender,
          email: email.trim().toLowerCase(),
          participation_type: participationType,
          group_name: participationType === 'group' ? groupName.trim() : undefined,
          team_members: participationType === 'group' ? validMembers : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: 'Registration Successful! 🎉',
          description: `You have successfully registered for "${event.title}".`,
        });
        onOpenChange(false);
        if (onRegistered) onRegistered();
      } else {
        toast({
          title: 'Registration Failed',
          description: data.error || 'Could not complete registration.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while submitting.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#29B5E8] text-white">Event Registration</Badge>
            <span className="text-xs text-muted-foreground">{event.category.toUpperCase()}</span>
          </div>
          <DialogTitle className="text-xl font-extrabold">{event.title}</DialogTitle>
          <DialogDescription className="text-xs">
            {event.event_date ? `Date: ${formatDate(event.event_date)}` : 'Upcoming Event'}
            {event.location ? ` • Venue: ${event.location}` : ''}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Section: Primary Registrant Information */}
          <div className="rounded-xl border p-4 bg-muted/20 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#29B5E8]" /> Primary Participant / Team Leader Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Full Name */}
              <div className="space-y-1">
                <Label htmlFor="reg-name" className="text-xs">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-name"
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-9 text-sm"
                  required
                />
              </div>

              {/* Roll Number */}
              <div className="space-y-1">
                <Label htmlFor="reg-roll" className="text-xs">
                  College Roll No. <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-roll"
                  placeholder="e.g. TMSL-2023-CSE-042"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="h-9 text-sm"
                  required
                />
              </div>

              {/* Department */}
              <div className="space-y-1">
                <Label htmlFor="reg-dept" className="text-xs">
                  Department <span className="text-destructive">*</span>
                </Label>
                <Select value={department} onValueChange={setDepartment} required>
                  <SelectTrigger id="reg-dept" className="h-9 text-sm">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <Label htmlFor="reg-phone" className="text-xs">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-phone"
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-9 text-sm"
                  required
                />
              </div>

              {/* Gender Selection */}
              <div className="space-y-1">
                <Label htmlFor="reg-gender" className="text-xs">
                  Gender <span className="text-destructive">*</span>
                </Label>
                <Select value={gender} onValueChange={(val: any) => setGender(val)} required>
                  <SelectTrigger id="reg-gender" className="h-9 text-sm">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <Label htmlFor="reg-email" className="text-xs">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="student@tmsl.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section: Participation Mode (Individual vs Group) */}
          <div className="rounded-xl border p-4 bg-muted/20 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-[#29B5E8]" /> Participation Type & Group Details
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setParticipationType('individual')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  participationType === 'individual'
                    ? 'border-[#29B5E8] bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-[#29B5E8]'
                    : 'hover:bg-muted/50 border-border'
                }`}
              >
                <p className="text-xs font-bold flex items-center gap-1.5">
                  <User className="h-4 w-4 text-[#29B5E8]" /> Individual Participation
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Participate solo as a single candidate.</p>
              </button>

              <button
                type="button"
                onClick={() => setParticipationType('group')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  participationType === 'group'
                    ? 'border-[#29B5E8] bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-[#29B5E8]'
                    : 'hover:bg-muted/50 border-border'
                }`}
              >
                <p className="text-xs font-bold flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-[#29B5E8]" /> Group / Team Participation
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Participate with your project team or club squad.</p>
              </button>
            </div>

            {/* If Group participation selected: Group Name & Team Members */}
            {participationType === 'group' && (
              <div className="space-y-3 pt-2 border-t mt-3">
                <div className="space-y-1">
                  <Label htmlFor="group-name" className="text-xs">
                    Group / Team Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="group-name"
                    placeholder="e.g. Alpha Coders / Neural Knights"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="h-9 text-sm"
                    required={participationType === 'group'}
                  />
                </div>

                {/* Team Members List */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Additional Team Members (Optional / As required)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddMember}
                      className="text-xs h-7 px-2"
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Member
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {teamMembers.map((member, idx) => (
                      <div key={idx} className="p-3 rounded-lg border bg-background space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-muted-foreground">
                            Member #{idx + 2}
                          </span>
                          {teamMembers.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveMember(idx)}
                              className="h-6 w-6 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <Input
                            placeholder="Member Name"
                            value={member.name}
                            onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                            className="h-8 text-xs"
                          />
                          <Input
                            placeholder="College Roll No."
                            value={member.rollNumber}
                            onChange={(e) => handleMemberChange(idx, 'rollNumber', e.target.value)}
                            className="h-8 text-xs"
                          />
                          <Input
                            placeholder="Member Email"
                            type="email"
                            value={member.email}
                            onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#29B5E8] hover:bg-[#29B5E8]/90 text-white font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Complete Registration
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
