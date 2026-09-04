"use client";

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Filter, RefreshCw, Plus } from 'lucide-react';
import { EventData } from '@/lib/types';
import { EventCard } from '@/components/event-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { AddEventDialog } from '@/components/add-event-dialog';
import { EventRegistrationDialog } from '@/components/event-registration-dialog';

import Link from 'next/link';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';

const FILTERS = ["All", "Upcoming", "Hackathon", "Placement", "Workshop", "Academic", "Clubs"];

export default function EventsPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [selectedEventForReg, setSelectedEventForReg] = useState<EventData | null>(null);
  const [isRegDialogOpen, setIsRegDialogOpen] = useState(false);

  const fetchEvents = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      let url = '/api/events';
      const params = new URLSearchParams();
      if (activeFilter === "Upcoming") {
        params.append('upcoming', 'true');
      } else if (activeFilter !== "All") {
        params.append('category', activeFilter.toLowerCase());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setEvents(data.data);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Failed to fetch events", error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyRegistrations = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/events/registrations/my?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success && data.data?.registeredEventIds) {
        setRegisteredEventIds(data.data.registeredEventIds);
      }
    } catch (e) {
      console.error("Failed to fetch my registrations", e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEvents();
      fetchMyRegistrations();
    }
  }, [activeFilter, user]);

  if (!authLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <Card className="p-8 shadow-xl border-slate-200 dark:border-slate-800">
          <div className="mx-auto w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-4 text-[#29B5E8]">
            <CalendarIcon className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold mb-2">Sign In Required</CardTitle>
          <CardDescription className="text-sm mb-6">
            Please log in as a student or administrator to view institutional events, hackathons, and placement drives.
          </CardDescription>
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full bg-[#29B5E8] hover:bg-[#29B5E8]/90 text-white font-semibold">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/register">Student Register</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-[#29B5E8]" />
            Events & Activities
          </h1>
          <p className="mt-2 text-muted-foreground">
            Live timeline of college events, deadlines, and placement drives stored in Snowflake.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button
              onClick={() => setIsAddEventOpen(true)}
              className="bg-[#29B5E8] hover:bg-[#29B5E8]/90 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Event
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchEvents}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="mb-8 overflow-x-auto pb-2">
        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
          <TabsList className="h-12 w-max justify-start">
            <div className="flex items-center px-2 mr-2 text-muted-foreground border-r">
              <Filter className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium mr-2">Filter</span>
            </div>
            {FILTERS.map(filter => (
              <TabsTrigger key={filter} value={filter} className="px-6 h-9">
                {filter}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] w-full rounded-xl" />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map(event => (
            <EventCard 
              key={event.event_id} 
              event={event}
              isRegistered={registeredEventIds.includes(event.event_id)}
              onRegisterClick={!isAdmin ? (ev) => {
                setSelectedEventForReg(ev);
                setIsRegDialogOpen(true);
              } : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border rounded-2xl bg-slate-50 dark:bg-slate-900/50">
          <CalendarIcon className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <h3 className="text-xl font-semibold">No events found</h3>
          <p className="text-muted-foreground mt-2">
            There are no events matching your selected filter.
          </p>
        </div>
      )}

      {/* Add Event Dialog Modal for Admin */}
      <AddEventDialog
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        onEventCreated={fetchEvents}
      />

      {/* Event Registration Dialog for Students */}
      <EventRegistrationDialog
        event={selectedEventForReg}
        open={isRegDialogOpen}
        onOpenChange={setIsRegDialogOpen}
        onRegistered={() => {
          fetchMyRegistrations();
        }}
      />
    </div>
  );
}
