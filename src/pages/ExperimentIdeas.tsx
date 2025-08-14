import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Lightbulb, Calendar, User, Target, Clock, Tag } from "lucide-react";
import { useExperimentIdeas } from "@/hooks/useExperimentIdeas";
import CreateIdeaDialog from "@/components/CreateIdeaDialog";
import EditIdeaDialog from "@/components/EditIdeaDialog";
import DraggableGrid from "@/components/DraggableGrid";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const ExperimentIdeas = () => {
  const { ideas, isLoading, convertToExperiment } = useExperimentIdeas();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.hypothesis?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || idea.status === selectedStatus;
    const matchesPriority = selectedPriority === "all" || idea.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'researching':
        return 'bg-yellow-100 text-yellow-800';
      case 'brainstorming':
        return 'bg-purple-100 text-purple-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleConvertToExperiment = async (id: string) => {
    try {
      await convertToExperiment.mutateAsync(id);
      toast({
        title: "Success",
        description: "Experiment idea converted to experiment!",
      });
    } catch (error) {
      console.error("Error converting idea to experiment:", error);
      toast({
        title: "Error",
        description: "Failed to convert idea to experiment",
        variant: "destructive",
      });
    }
  };

  const renderIdeaCard = (idea: any) => (
    <Card key={idea.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{idea.title}</CardTitle>
          <Badge className={getStatusColor(idea.status)}>
            {idea.status.replace('_', ' ')}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{idea.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-gray-400" />
            <span>{idea.hypothesis}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-400" />
            <span>{idea.methodology}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{format(new Date(idea.created_at), 'MMM d, yyyy')}</span>
          </div>
        </div>

        <div className="flex justify-between">
          <Badge className={getPriorityColor(idea.priority)}>
            {idea.priority}
          </Badge>
          <div className="flex gap-2">
            <EditIdeaDialog idea={idea} />
            <Button size="sm" onClick={() => handleConvertToExperiment(idea.id)}>
              Convert to Experiment
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Experiment Ideas</h1>
            <p className="text-gray-600 mt-1">Brainstorm and plan your next experiments</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Idea
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search ideas..."
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
              <SelectItem value="brainstorming">Brainstorming</SelectItem>
              <SelectItem value="researching">Researching</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Ideas</p>
                  <p className="text-2xl font-bold">{ideas.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Researching</p>
                  <p className="text-2xl font-bold">
                    {ideas.filter(e => e.status === 'researching').length}
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
                  <p className="text-sm text-gray-600">Ready</p>
                  <p className="text-2xl font-bold">
                    {ideas.filter(e => e.status === 'ready').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Brainstorming</p>
                  <p className="text-2xl font-bold">
                    {ideas.filter(e => e.status === 'brainstorming').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.length > 0 ? (
            <DraggableGrid
              items={filteredIdeas}
              renderItem={renderIdeaCard}
              droppableId="experiment-ideas"
            />
          ) : (
            <div className="text-center py-12">
              <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedStatus !== "all" || selectedPriority !== "all"
                  ? "Try adjusting your filters"
                  : "Start brainstorming your next big idea"}
              </p>
              {!(searchTerm || selectedStatus !== "all" || selectedPriority !== "all") && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  Create Idea
                </Button>
              )}
            </div>
          )}
        </div>

        <CreateIdeaDialog 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen} 
        />
      </div>
    </div>
  );
};

export default ExperimentIdeas;
