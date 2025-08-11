import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCalendarEvents, CalendarEvent } from "@/hooks/useCalendarEvents";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Calendar, MapPin, Clock, Users } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

interface EventDetailsDialogProps {
  event: CalendarEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EventDetailsDialog = ({ event, open, onOpenChange }: EventDetailsDialogProps) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const formatDateTimeLocal = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || "",
    event_type: event.event_type,
    start_time: formatDateTimeLocal(event.start_time),
    end_time: formatDateTimeLocal(event.end_time),
    location: event.location || "",
    status: event.status,
    reminder_enabled: event.reminder_enabled || false,
    reminder_minutes_before: event.reminder_minutes_before || 15,
    sms_reminder_enabled: event.sms_reminder_enabled || false,
    sms_reminder_phone: event.sms_reminder_phone || "",
    sms_reminder_minutes_before: event.reminder_minutes_before || 15,
  });

  const { updateEvent, deleteEvent } = useCalendarEvents();
  const { toast } = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const startDate = new Date(formData.start_time);
      const endDate = new Date(formData.end_time);
      
      if (endDate <= startDate) {
        toast({
          title: "Invalid Time Range",
          description: "End time must be after start time",
          variant: "destructive",
        });
        return;
      }

      // Validate SMS phone number if SMS reminder is enabled
      if (formData.sms_reminder_enabled && !formData.sms_reminder_phone.trim()) {
        toast({
          title: "Phone Number Required",
          description: "Please enter a phone number for SMS reminders",
          variant: "destructive",
        });
        return;
      }

      // Prepare update data with only the fields that exist in the database
      const updateData = {
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        location: formData.location,
        status: formData.status,
        reminder_enabled: formData.reminder_enabled,
        reminder_minutes_before: formData.reminder_minutes_before,
        sms_reminder_enabled: formData.sms_reminder_enabled,
        sms_reminder_phone: formData.sms_reminder_phone,
        sms_reminder_minutes_before: formData.sms_reminder_minutes_before,
      };

      console.log('Updating event with data:', updateData);

      await updateEvent.mutateAsync({
        id: event.id,
        ...updateData,
      });
      toast({
        title: "Success",
        description: "Event updated successfully!",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvent.mutateAsync(event.id);
      toast({
        title: "Success",
        description: "Event deleted successfully!",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isEditing ? "Edit Event" : "Event Details"}
            <div className="flex gap-2">
              {!isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Event</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{event.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Enter event description..."
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="event_type">Event Type</Label>
              <Select 
                value={formData.event_type} 
                onValueChange={(value: "meeting" | "maintenance" | "experiment" | "training" | "booking") => 
                  setFormData({ ...formData, event_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="experiment">Experiment</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="booking">Booking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: "scheduled" | "cancelled" | "completed") => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reminder_enabled"
                  checked={formData.reminder_enabled}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, reminder_enabled: checked as boolean })
                  }
                />
                <Label htmlFor="reminder_enabled">Enable email reminder</Label>
              </div>
              
              {formData.reminder_enabled && (
                <div>
                  <Label htmlFor="reminder_minutes">Email reminder (minutes before)</Label>
                  <Select
                    value={formData.reminder_minutes_before.toString()}
                    onValueChange={(value) => 
                      setFormData({ ...formData, reminder_minutes_before: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="1440">1 day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sms_reminder_enabled"
                  checked={formData.sms_reminder_enabled}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, sms_reminder_enabled: checked as boolean })
                  }
                />
                <Label htmlFor="sms_reminder_enabled">Enable SMS reminder</Label>
              </div>

              {formData.sms_reminder_enabled && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sms_reminder_phone">Phone Number for SMS</Label>
                    <Input
                      id="sms_reminder_phone"
                      type="tel"
                      value={formData.sms_reminder_phone}
                      onChange={(e) => setFormData({ ...formData, sms_reminder_phone: e.target.value })}
                      placeholder="+1234567890"
                    />
                    <p className="text-sm text-muted-foreground">Include country code (e.g., +1 for US numbers)</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="sms_reminder_minutes">SMS reminder (minutes before)</Label>
                    <Select
                      value={formData.sms_reminder_minutes_before.toString()}
                      onValueChange={(value) => 
                        setFormData({ ...formData, sms_reminder_minutes_before: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="1440">1 day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateEvent.isPending}>
                {updateEvent.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <p className="text-sm text-gray-600 capitalize">{event.event_type}</p>
            </div>
            
            {event.description && (
              <div>
                <Label>Description</Label>
                <div 
                  className="text-sm mt-1 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{formatDateTime(event.start_time)} - {formatDateTime(event.end_time)}</span>
              </div>
              
              {event.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{event.location}</span>
                </div>
              )}
              
              {event.attendees && event.attendees.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{event.attendees.length} attendees</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <span className={`text-sm px-2 py-1 rounded-full ${
                event.status === 'completed' ? 'bg-green-100 text-green-800' :
                event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {event.status}
              </span>
            </div>

            {(event.reminder_enabled || event.sms_reminder_enabled) && (
              <div className="space-y-2">
                <Label>Reminders:</Label>
                <div className="text-sm text-gray-600">
                  {event.reminder_enabled && (
                    <div>Email reminder: {event.reminder_minutes_before} minutes before</div>
                  )}
                  {event.sms_reminder_enabled && (
                    <div>SMS reminder: {event.sms_reminder_minutes_before || event.reminder_minutes_before} minutes before to {event.sms_reminder_phone}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;
