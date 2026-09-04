"use client";

import React, { useState } from 'react';
import { Calendar, Plus, Loader2, MapPin, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const EVENT_CATEGORIES = [
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'workshop', label: 'Workshop / Seminar' },
  { value: 'career', label: 'Placement / Internship Drive' },
  { value: 'exam', label: 'Examination Schedule' },
  { value: 'event', label: 'College Fest / Cultural' },
  { value: 'academic', label: 'Academic Notice' },
  { value: 'club', label: 'Student Club Activity' },
];

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated: () => void;
}

export function AddEventDialog({ open, onOpenChange, onEventCreated }: AddEventDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('hackathon');
  const [eventDate, setEventDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [location, setLocation] = useState('TMSL Campus Auditorium');
  const [organizer, setOrganizer] = useState('College Administration');
  const [eligibility, setEligibility] = useState('All Departments & Batches');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !eventDate) {
      toast({
        title: 'Missing Fields',
        description: 'Please specify the Event Title and Event Date.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          event_date: eventDate,
          registration_deadline: registrationDeadline || undefined,
          location,
          organizer,
          eligibility,
          description,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: 'Event Created Successfully! 🎉',
          description: 'The event is now published and immediately visible to all students.',
        });
        onEventCreated();
        onOpenChange(false);

        // Reset fields
        setTitle('');
        setDescription('');
        setEventDate('');
        setRegistrationDeadline('');
        setLocation('TMSL Campus Auditorium');
        setOrganizer('College Administration');
        setEligibility('All Departments & Batches');
      } else {
        toast({
          title: 'Failed to create event',
          description: data.error || 'Server error',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Calendar className="h-5 w-5 text-[#29B5E8]" />
              Add College Event
            </DialogTitle>
            <DialogDescription>
              Create and publish a new event. Events created here will automatically appear for all students.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 text-sm">
            <div className="space-y-1.5">
              <Label htmlFor="event-title">Event Title *</Label>
              <Input
                id="event-title"
                placeholder="e.g. AI Innovation Hackathon 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="event-category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="event-category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="event-organizer">Organizer *</Label>
                <Input
                  id="event-organizer"
                  placeholder="e.g. ACM Student Chapter / CSE Dept"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="event-date">Event Date & Time *</Label>
                <Input
                  id="event-date"
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="registration-deadline">Registration Deadline (Optional)</Label>
                <Input
                  id="registration-deadline"
                  type="datetime-local"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="event-location">Venue / Location</Label>
                <Input
                  id="event-location"
                  placeholder="e.g. Main Auditorium / Lab 402"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="event-eligibility">Eligibility</Label>
                <Input
                  id="event-eligibility"
                  placeholder="e.g. 2nd & 3rd Year CSE / Open to All"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-description">Event Details & Instructions</Label>
              <Textarea
                id="event-description"
                placeholder="Provide event overview, registration link or requirements..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
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
              className="bg-[#29B5E8] hover:bg-[#29B5E8]/90 text-white font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing Event...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Publish Event for All Students
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
