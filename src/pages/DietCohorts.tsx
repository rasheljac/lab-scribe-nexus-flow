
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Apple, Calendar, Users, BarChart3, Eye, Edit, Trash2 } from "lucide-react";
import { useDietCohorts, useDeleteDietCohort } from "@/hooks/useDietCohorts";
import { CreateDietCohortDialog } from "@/components/CreateDietCohortDialog";
import { EditDietCohortDialog } from "@/components/EditDietCohortDialog";
import { DietCohortMeasurementsDialog } from "@/components/DietCohortMeasurementsDialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const DietCohorts = () => {
  const { data: cohorts, isLoading } = useDietCohorts();
  const deleteCohort = useDeleteDietCohort();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDietType, setSelectedDietType] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [measurementsDialogOpen, setMeasurementsDialogOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<any>(null);
  const { toast } = useToast();

  const filteredCohorts = cohorts?.filter(cohort => {
    const matchesSearch = cohort.cohort_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cohort.diet_description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDietType = selectedDietType === "all" || cohort.diet_type === selectedDietType;
    
    return matchesSearch && matchesDietType;
  }) || [];

  const getDietTypeColor = (dietType: string) => {
    switch (dietType) {
      case 'high_fat':
        return 'bg-red-100 text-red-800';
      case 'low_fat':
        return 'bg-green-100 text-green-800';
      case 'high_protein':
        return 'bg-blue-100 text-blue-800';
      case 'low_protein':
        return 'bg-yellow-100 text-yellow-800';
      case 'ketogenic':
        return 'bg-purple-100 text-purple-800';
      case 'control':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (cohort: any) => {
    setSelectedCohort(cohort);
    setEditDialogOpen(true);
  };

  const handleViewMeasurements = (cohort: any) => {
    setSelectedCohort(cohort);
    setMeasurementsDialogOpen(true);
  };

  const handleDelete = async (cohortId: string) => {
    if (window.confirm('Are you sure you want to delete this diet cohort? This action cannot be undone.')) {
      try {
        await deleteCohort.mutateAsync(cohortId);
        toast({
          title: "Success",
          description: "Diet cohort deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete diet cohort",
          variant: "destructive",
        });
      }
    }
  };

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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Diet Cohorts</h1>
            <p className="text-gray-600 mt-1">Manage diet intervention groups and track their progress</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Diet Cohort
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search diet cohorts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedDietType} onValueChange={setSelectedDietType}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by diet type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Diet Types</SelectItem>
              <SelectItem value="control">Control</SelectItem>
              <SelectItem value="high_fat">High Fat</SelectItem>
              <SelectItem value="low_fat">Low Fat</SelectItem>
              <SelectItem value="high_protein">High Protein</SelectItem>
              <SelectItem value="low_protein">Low Protein</SelectItem>
              <SelectItem value="ketogenic">Ketogenic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Apple className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Cohorts</p>
                  <p className="text-2xl font-bold">{cohorts?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Cohorts</p>
                  <p className="text-2xl font-bold">
                    {cohorts?.filter(c => c.status === 'active').length || 0}
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
                  <p className="text-sm text-gray-600">Total Animals</p>
                  <p className="text-2xl font-bold">
                    {cohorts?.reduce((sum, c) => sum + (c.number_of_mice || 0), 0) || 0}
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
                  <p className="text-sm text-gray-600">Avg Duration</p>
                  <p className="text-2xl font-bold">
                    {cohorts?.length 
                      ? Math.round(cohorts.reduce((sum, c) => sum + (c.duration_weeks || 0), 0) / cohorts.length)
                      : 0
                    } weeks
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cohorts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCohorts.map((cohort) => (
            <Card key={cohort.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{cohort.cohort_name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getDietTypeColor(cohort.diet_type)}>
                      {cohort.diet_type.replace('_', ' ')}
                    </Badge>
                    {cohort.status === 'active' && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {cohort.diet_description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{cohort.number_of_mice} animals</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{cohort.duration_weeks} weeks duration</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BarChart3 className="h-4 w-4" />
                    <span>Started at {cohort.age_at_start_weeks} weeks</span>
                  </div>
                  
                  {cohort.start_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Started {format(new Date(cohort.start_date), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewMeasurements(cohort)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(cohort)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(cohort.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCohorts.length === 0 && (
          <div className="text-center py-12">
            <Apple className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No diet cohorts found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedDietType !== "all"
                ? "Try adjusting your filters"
                : "Create your first diet cohort to get started"}
            </p>
            {!(searchTerm || selectedDietType !== "all") && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                Create Diet Cohort
              </Button>
            )}
          </div>
        )}

        <CreateDietCohortDialog 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen} 
        />
        
        {selectedCohort && (
          <>
            <EditDietCohortDialog 
              open={editDialogOpen} 
              onOpenChange={setEditDialogOpen}
              cohort={selectedCohort}
            />
            
            <DietCohortMeasurementsDialog 
              open={measurementsDialogOpen} 
              onOpenChange={setMeasurementsDialogOpen}
              cohort={selectedCohort}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DietCohorts;
