
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, MapPin, Users } from "lucide-react";

interface DayEventsPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  events: any[];
  onEventClick: (event: any) => void;
}

const DayEventsPopup = ({ open, onOpenChange, date, events, onEventClick }: DayEventsPopupProps) => {
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800";
      case "experiment":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-orange-100 text-orange-800";
      case "conference":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Events for {format(date, "MMMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => {
                onEventClick(event);
                onOpenChange(false);
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getEventTypeColor(event.event_type)}>
                  {event.event_type}
                </Badge>
              </div>
              <h4 className="font-medium text-sm mb-2">{event.title}</h4>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {format(parseISO(event.start_time), "HH:mm")} - {format(parseISO(event.end_time), "HH:mm")}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.attendees && event.attendees.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              {event.description && (
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{event.description}</p>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DayEventsPopup;
