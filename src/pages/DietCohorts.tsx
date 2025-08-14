
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Users, Calendar, Activity, BarChart3 } from "lucide-react";
import { useDietCohorts, useUpdateDietCohort } from "@/hooks/useDietCohorts";
import { CreateDietCohortDialog } from "@/components/CreateDietCohortDialog";
import { EditDietCohortDialog } from "@/components/EditDietCohortDialog";
import PaginatedDraggableGrid from "@/components/PaginatedDraggableGrid";
import { format } from "date-fns";

const DietCohorts = () => {
  const { data: cohorts = [], isLoading } = useDietCohorts();
  const updateMutation = useUpdateDietCohort();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<any>(null);

  const filteredCohorts = cohorts.filter(cohort => {
    const matchesSearch = cohort.cohort_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cohort.diet_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || cohort.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

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

  const handleEdit = (cohort: any) => {
    setSelectedCohort(cohort);
    setEditDialogOpen(true);
  };

  const handleReorder = async (reorderedCohorts: any[]) => {
    console.log("Reordering cohorts:", reorderedCohorts);
    
    // Update display_order for each cohort
    for (let i = 0; i < reorderedCohorts.length; i++) {
      const cohort = reorderedCohorts[i];
      if (cohort.display_order !== i + 1) {
        await updateMutation.mutateAsync({
          id: cohort.id,
          display_order: i + 1
        });
      }
    }
  };

  const renderCohortCard = (cohort: any) => (
    <Card key={cohort.id} className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{cohort.cohort_name}</CardTitle>
          <Badge className={getStatusColor(cohort.status)}>
            {cohort.status}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {cohort.diet_type} - {cohort.diet_description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{cohort.number_of_mice} mice</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Started {format(new Date(cohort.start_date), 'MMM d, yyyy')}</span>
          </div>
          
          {cohort.duration_weeks && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Activity className="h-4 w-4" />
              <span>{cohort.duration_weeks} weeks duration</span>
            </div>
          )}

          {cohort.monitoring_frequency && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BarChart3 className="h-4 w-4" />
              <span>Monitored {cohort.monitoring_frequency}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(cohort);
            }}
          >
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const emptyState = (
    <div className="text-center py-12">
      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No diet cohorts found</h3>
      <p className="text-gray-600 mb-4">
        {searchTerm || selectedStatus !== "all"
          ? "Try adjusting your filters"
          : "Create your first diet cohort to get started"}
      </p>
      {!(searchTerm || selectedStatus !== "all") && (
        <Button onClick={() => setCreateDialogOpen(true)}>
          Create Cohort
        </Button>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Diet Cohorts</h1>
            <p className="text-gray-600 mt-1">Manage your diet study cohorts</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Cohort
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search cohorts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Cohorts</p>
                  <p className="text-2xl font-bold">{cohorts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold">
                    {cohorts.filter(c => c.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Planning</p>
                  <p className="text-2xl font-bold">
                    {cohorts.filter(c => c.status === 'planning').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">
                    {cohorts.filter(c => c.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <PaginatedDraggableGrid
          items={filteredCohorts}
          onReorder={handleReorder}
          renderItem={renderCohortCard}
          droppableId="diet-cohorts"
          itemsPerPage={6}
          emptyState={emptyState}
        />

        <CreateDietCohortDialog 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen}
        />
        
        {selectedCohort && (
          <EditDietCohortDialog 
            cohort={selectedCohort}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
        )}
      </div>
    </div>
  );
};

export default DietCohorts;
