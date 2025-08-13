
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Beaker, Calendar, Scale } from "lucide-react";
import { useDietCohorts } from "@/hooks/useDietCohorts";
import CreateDietCohortDialog from "@/components/CreateDietCohortDialog";
import EditDietCohortDialog from "@/components/EditDietCohortDialog";
import DietCohortDetailsDialog from "@/components/DietCohortDetailsDialog";
import { format } from "date-fns";

const DietCohorts = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<any>(null);
  const { cohorts, isLoading } = useDietCohorts();

  const handleEditCohort = (cohort: any) => {
    setSelectedCohort(cohort);
    setEditDialogOpen(true);
  };

  const handleViewDetails = (cohort: any) => {
    setSelectedCohort(cohort);
    setDetailsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Beaker className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Diet Mice Cohorts</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Beaker className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Diet Mice Cohorts</h1>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Cohort
        </Button>
      </div>

      {cohorts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Beaker className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No diet cohorts yet</h3>
            <p className="text-gray-500 text-center mb-4">
              Create your first diet mice cohort to start tracking feeding studies.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Cohort
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cohorts.map((cohort) => (
            <Card key={cohort.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{cohort.cohort_name}</CardTitle>
                    <p className="text-sm text-gray-600">{cohort.diet_type}</p>
                  </div>
                  <Badge className={getStatusColor(cohort.status)}>
                    {cohort.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Scale className="h-4 w-4 text-gray-400" />
                    <span>{cohort.number_of_mice} mice ({cohort.sex})</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Started {format(new Date(cohort.start_date), 'MMM dd, yyyy')}</span>
                  </div>
                  {cohort.duration_weeks && (
                    <div className="text-sm text-gray-600">
                      Duration: {cohort.duration_weeks} weeks
                    </div>
                  )}
                  {cohort.mouse_strain && (
                    <div className="text-sm text-gray-600">
                      Strain: {cohort.mouse_strain}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(cohort)}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCohort(cohort)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
          <DietCohortDetailsDialog
            cohort={selectedCohort}
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
          />
        </>
      )}
    </div>
  );
};

export default DietCohorts;
