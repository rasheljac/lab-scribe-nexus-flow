
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Users, Scale, Clock } from "lucide-react";
import { useDietCohorts } from "@/hooks/useDietCohorts";
import { CreateDietCohortDialog } from "@/components/CreateDietCohortDialog";
import { EditDietCohortDialog } from "@/components/EditDietCohortDialog";
import { DietCohortMeasurementsDialog } from "@/components/DietCohortMeasurementsDialog";
import { format, differenceInDays } from "date-fns";

const DietCohorts = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [measurementsDialogOpen, setMeasurementsDialogOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<any>(null);
  
  const { cohorts, loading } = useDietCohorts();

  const handleEdit = (cohort: any) => {
    setSelectedCohort(cohort);
    setEditDialogOpen(true);
  };

  const handleViewMeasurements = (cohort: any) => {
    setSelectedCohort(cohort);
    setMeasurementsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'paused': return 'outline';
      default: return 'default';
    }
  };

  const calculateDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    return differenceInDays(end, start);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading diet cohorts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Diet Mice Cohorts</h1>
          <p className="text-muted-foreground">
            Track and manage diet studies with mice cohorts
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Cohort
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cohorts.map((cohort) => (
          <Card key={cohort.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{cohort.cohort_name}</CardTitle>
                <Badge variant={getStatusColor(cohort.status)}>
                  {cohort.status}
                </Badge>
              </div>
              <CardDescription>{cohort.diet_type}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{cohort.number_of_mice} mice</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <span>{cohort.sex}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(cohort.start_date), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{calculateDuration(cohort.start_date, cohort.end_date)} days</span>
                </div>
              </div>
              
              {cohort.diet_description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {cohort.diet_description}
                </p>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEdit(cohort)}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleViewMeasurements(cohort)}
                  className="flex-1"
                >
                  Measurements
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cohorts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No diet cohorts yet</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your diet studies by creating your first cohort.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Cohort
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateDietCohortDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedCohort && (
        <>
          <EditDietCohortDialog
            cohort={selectedCohort}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
          <DietCohortMeasurementsDialog
            cohort={selectedCohort}
            open={measurementsDialogOpen}
            onOpenChange={setMeasurementsDialogOpen}
          />
        </>
      )}
    </div>
  );
};

export default DietCohorts;
