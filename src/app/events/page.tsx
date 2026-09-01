"use client";

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { EventData } from '@/lib/types';
import { EventCard } from '@/components/event-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const FILTERS = ["All", "Upcoming", "Hackathons", "Workshops", "Academic", "Career", "Clubs"];

export default function EventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const fetchEvents = async () => {
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
        if (data.success) {
          setEvents(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [activeFilter]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight flex justify-center md:justify-start items-center gap-3">
          <CalendarIcon className="h-8 w-8 text-[#29B5E8]" />
          Events & Activities
        </h1>
        <p className="mt-2 text-muted-foreground">
          Auto-extracted timeline of college events, deadlines, and schedules.
        </p>
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
            <Skeleton key={i} className="h-[300px] w-full rounded-xl" />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map(event => (
            <EventCard key={event.event_id} event={event} />
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
    </div>
  );
}
