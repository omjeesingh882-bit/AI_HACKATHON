"use client";
import * as React from "react";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { EventData } from "@/lib/types";
import { formatRelativeDate, getCategoryColor, truncateText } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function EventCard({ event }: { event: EventData }) {
  return (
    <Card className="flex flex-col h-full overflow-hidden border-l-4 border-l-primary/60 hover:shadow-md transition-all">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge className={getCategoryColor(event.category)} variant="outline">
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </Badge>
          {event.registration_deadline && (
            <Badge variant="secondary" className="flex items-center gap-1 text-[10px]">
              <Clock className="h-3 w-3" />
              Due {formatRelativeDate(event.registration_deadline)}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg leading-tight line-clamp-2">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-4 text-sm">
        <p className="text-muted-foreground line-clamp-3 mb-4">
          {truncateText(event.description, 180)}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span className="font-medium text-foreground">{formatRelativeDate(event.event_date)}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{event.location}</span>
          </div>
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{event.organizer}</span>
          </div>
        </div>
      </CardContent>
      {event.eligibility && (
        <CardFooter className="bg-muted/30 py-3 border-t">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Eligibility: </span>
            {event.eligibility}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}