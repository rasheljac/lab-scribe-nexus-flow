
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Beaker, Calendar, User, Hash } from "lucide-react";
import { useExperiments } from "@/hooks/useExperiments";
import CreateExperimentDialog from "@/components/CreateExperimentDialog";
import PaginatedDraggableGrid from "@/components/PaginatedDraggableGrid";
import RichTextDisplay from "@/components/RichTextDisplay";
import { format } from "date-fns";

const Experiments = () => {
  const navigate = useNavigate();
  const { experiments, isLoading, updateExperimentOrder } = useExperiments();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const filteredExperiments = experiments.filter(experiment => {
    const matchesSearch = experiment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         experiment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = selectedProject === "all" || experiment.project_id === selectedProject;
    const matchesStatus = selectedStatus === "all" || experiment.status === selectedStatus;
    
    return matchesSearch && matchesProject && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'on_hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'biochemistry': 'bg-purple-100 text-purple-800',
      'molecular-biology': 'bg-blue-100 text-blue-800',
      'cell-biology': 'bg-green-100 text-green-800',
      'genetics': 'bg-red-100 text-red-800',
      'microbiology': 'bg-yellow-100 text-yellow-800',
      'immunology': 'bg-indigo-100 text-indigo-800',
      'neuroscience': 'bg-pink-100 text-pink-800',
      'pharmacology': 'bg-orange-100 text-orange-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleReorder = async (reorderedExperiments: any[]) => {
    const updates = reorderedExperiments.map((experiment, index) => ({
      id: experiment.id,
      display_order: index + 1
    }));
    await updateExperimentOrder.mutateAsync(updates);
  };

  const renderExperimentCard = (experiment: any) => (
    <Card 
      key={experiment.id} 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/experiments/${experiment.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{experiment.title}</CardTitle>
          <Badge className={getStatusColor(experiment.status)}>
            {experiment.status.replace('_', ' ')}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          <RichTextDisplay 
            content={experiment.description || ""} 
            maxLength={150}
            className="text-sm"
          />
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className={getCategoryColor(experiment.category)}>
              {experiment.category.replace('-', ' ')}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{experiment.researcher}</span>
          </div>
          
          {experiment.start_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Started {format(new Date(experiment.start_date), 'MMM d, yyyy')}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Beaker className="h-4 w-4" />
            <span>{experiment.protocols} protocols • {experiment.samples} samples</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const emptyState = (
    <div className="text-center py-12">
      <Beaker className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No experiments found</h3>
      <p className="text-gray-600 mb-4">
        {searchTerm || selectedProject !== "all" || selectedStatus !== "all"
          ? "Try adjusting your filters"
          : "Create your first experiment to get started"}
      </p>
      {!(searchTerm || selectedProject !== "all" || selectedStatus !== "all") && (
        <Button onClick={() => setCreateDialogOpen(true)}>
          New Experiment
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
            <h1 className="text-3xl font-bold">Experiments</h1>
            <p className="text-gray-600 mt-1">Track and manage your research experiments</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Experiment
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search experiments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{experiments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Beaker className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold">
                    {experiments.filter(e => e.status === 'in_progress').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">
                    {experiments.filter(e => e.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Planning</p>
                  <p className="text-2xl font-bold">
                    {experiments.filter(e => e.status === 'planning').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <PaginatedDraggableGrid
          items={filteredExperiments}
          onReorder={handleReorder}
          renderItem={renderExperimentCard}
          droppableId="experiments"
          itemsPerPage={6}
          emptyState={emptyState}
          layout="grid"
        />

        <CreateExperimentDialog 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen}
        />
      </div>
    </div>
  );
};

export default Experiments;
