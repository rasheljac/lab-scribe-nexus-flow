
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import CreateEventDialog from "@/components/CreateEventDialog";
import EventDetailsDialog from "@/components/EventDetailsDialog";
import DayEventsPopup from "@/components/DayEventsPopup";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);
  const [dayEventsOpen, setDayEventsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  const { events, loading } = useCalendarEvents();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.event_date);
      return isSameDay(eventDate, date);
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'experiment':
        return 'bg-blue-100 text-blue-800';
      case 'meeting':
        return 'bg-green-100 text-green-800';
      case 'deadline':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDateClick = (date: Date) => {
    const dayEvents = getEventsForDay(date);
    if (dayEvents.length > 0) {
      setSelectedDate(date);
      setDayEventsOpen(true);
    } else {
      setSelectedDate(date);
      setCreateDialogOpen(true);
    }
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setEventDetailsOpen(true);
  };

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-7 gap-4">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Calendar</h1>
            <p className="text-gray-600 mt-1">Schedule and track your research activities</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Event
          </Button>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm">Experiments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm">Meetings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm">Deadlines</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-sm">Maintenance</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-6">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-4 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-4">
              {daysInMonth.map(date => {
                const dayEvents = getEventsForDay(date);
                const isCurrentMonth = isSameMonth(date, currentDate);
                const isCurrentDay = isToday(date);
                
                return (
                  <div
                    key={date.toISOString()}
                    onClick={() => handleDateClick(date)}
                    className={`min-h-[120px] p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      isCurrentDay ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    } ${!isCurrentMonth ? 'opacity-50' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-2 ${
                      isCurrentDay ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {format(date, 'd')}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                          className="text-xs p-1 rounded truncate hover:bg-white/50"
                          style={{
                            backgroundColor: event.event_type === 'experiment' ? '#dbeafe' :
                                           event.event_type === 'meeting' ? '#dcfce7' :
                                           event.event_type === 'deadline' ? '#fee2e2' : '#fef3c7'
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Your next scheduled activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events
                .filter(event => new Date(event.event_date) >= new Date())
                .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
                .slice(0, 5)
                .map(event => (
                  <div 
                    key={event.id} 
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-gray-600">
                        {format(new Date(event.event_date), 'MMM d, yyyy')}
                        {event.event_time && ` at ${event.event_time}`}
                      </div>
                    </div>
                    <Badge className={getEventTypeColor(event.event_type)}>
                      {event.event_type}
                    </Badge>
                  </div>
                ))}
              
              {events.filter(event => new Date(event.event_date) >= new Date()).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No upcoming events scheduled
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <CreateEventDialog 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen}
          selectedDate={selectedDate}
        />
        
        {selectedEvent && (
          <EventDetailsDialog 
            open={eventDetailsOpen} 
            onOpenChange={setEventDetailsOpen}
            event={selectedEvent}
          />
        )}
        
        {selectedDate && (
          <DayEventsPopup 
            open={dayEventsOpen} 
            onOpenChange={setDayEventsOpen}
            date={selectedDate}
            events={getEventsForDay(selectedDate)}
            onEventClick={handleEventClick}
          />
        )}
      </div>
    </div>
  );
};

export default Calendar;
