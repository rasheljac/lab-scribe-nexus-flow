
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Activity, BarChart3, FileText, Clock } from "lucide-react";
import { format } from "date-fns";
import RichTextDisplay from "@/components/RichTextDisplay";

interface DietCohortDetailsDialogProps {
  cohort: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DietCohortDetailsDialog = ({ cohort, open, onOpenChange }: DietCohortDetailsDialogProps) => {
  if (!cohort) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'paused':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl">{cohort.cohort_name}</DialogTitle>
            <Badge className={getStatusColor(cohort.status)}>
              {cohort.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Diet Type</label>
                <p className="text-sm">{cohort.diet_type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Number of Mice</label>
                <p className="text-sm">{cohort.number_of_mice}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Age at Start (weeks)</label>
                <p className="text-sm">{cohort.age_at_start_weeks || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Sex</label>
                <p className="text-sm">{cohort.sex || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Start Date</label>
                <p className="text-sm">{format(new Date(cohort.start_date), 'PPP')}</p>
              </div>
              {cohort.end_date && (
                <div>
                  <label className="text-sm font-medium text-gray-600">End Date</label>
                  <p className="text-sm">{format(new Date(cohort.end_date), 'PPP')}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Duration</label>
                <p className="text-sm">{cohort.duration_weeks ? `${cohort.duration_weeks} weeks` : 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-sm">{format(new Date(cohort.created_at), 'PPP')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Monitoring Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Monitoring Frequency</label>
                <p className="text-sm">{cohort.monitoring_frequency || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Measurement Parameters</label>
                <p className="text-sm">{cohort.measurement_parameters || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Additional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Housing Conditions</label>
                <p className="text-sm">{cohort.housing_conditions || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Environmental Factors</label>
                <p className="text-sm">{cohort.environmental_factors || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Diet Description */}
        {cohort.diet_description && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Diet Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextDisplay content={cohort.diet_description} />
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {cohort.notes && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextDisplay content={cohort.notes} />
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};
