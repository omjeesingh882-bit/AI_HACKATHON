"use client";
import * as React from "react";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { EventData } from "@/lib/types";
import { formatRelativeDate, formatDate, getCategoryColor, truncateText } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

export function EventCard({
  event,
  isRegistered,
  onRegisterClick,
}: {
  event: EventData;
  isRegistered?: boolean;
  onRegisterClick?: (event: EventData) => void;
}) {
  const categoryLabel = event.category 
    ? event.category.charAt(0).toUpperCase() + event.category.slice(1) 
    : "Event";

  const displayDate = event.event_date 
    ? formatRelativeDate(event.event_date)
    : (event.registration_deadline ? `Due ${formatDate(event.registration_deadline)}` : "Date Announced Soon");

  return (
    <Card className="flex flex-col h-full overflow-hidden border-l-4 border-l-primary/60 hover:shadow-md transition-all justify-between">
      <div>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start mb-2">
            <Badge className={getCategoryColor(event.category)} variant="outline">
              {categoryLabel}
            </Badge>
            {event.registration_deadline && (
              <Badge variant="secondary" className="flex items-center gap-1 text-[10px]">
                <Clock className="h-3 w-3" />
                Due {formatDate(event.registration_deadline)}
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg leading-tight line-clamp-2">{event.title || "College Event"}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-4 text-sm">
          <p className="text-muted-foreground line-clamp-3 mb-4">
            {truncateText(event.description || "No description provided.", 180)}
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span className="font-medium text-foreground">{displayDate}</span>
            </div>
            {event.location && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{event.location}</span>
              </div>
            )}
            {event.organizer && (
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{event.organizer}</span>
              </div>
            )}
          </div>
        </CardContent>
      </div>

      <CardFooter className="bg-muted/30 py-3 px-4 border-t flex flex-col gap-2.5">
        {event.eligibility && (
          <p className="text-xs text-muted-foreground w-full">
            <span className="font-semibold text-foreground">Eligibility: </span>
            {event.eligibility}
          </p>
        )}

        {onRegisterClick && (
          <div className="w-full pt-1">
            {isRegistered ? (
              <Badge className="w-full justify-center py-1.5 bg-emerald-600 text-white font-medium text-xs">
                ✓ Registered for Event
              </Badge>
            ) : (
              <Button
                size="sm"
                onClick={() => onRegisterClick(event)}
                className="w-full bg-[#29B5E8] hover:bg-[#29B5E8]/90 text-white text-xs font-semibold h-8"
              >
                Register for Event
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}