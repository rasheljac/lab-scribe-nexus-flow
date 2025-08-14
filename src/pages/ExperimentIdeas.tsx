
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Lightbulb, Calendar, User, Hash, GripVertical } from "lucide-react";
import { useExperimentIdeas } from "@/hooks/useExperimentIdeas";
import CreateIdeaDialog from "@/components/CreateIdeaDialog";
import EditIdeaDialog from "@/components/EditIdeaDialog";
import IdeaReportDialog from "@/components/IdeaReportDialog";
import DraggableGrid from "@/components/DraggableGrid";
import RichTextDisplay from "@/components/RichTextDisplay";
import { format } from "date-fns";

const ExperimentIdeas = () => {
  const navigate = useNavigate();
  const { ideas, isLoading, createIdea, updateIdea, deleteIdea, updateIdeaOrder } = useExperimentIdeas();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<any>(null);

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriority === "all" || idea.priority === selectedPriority;
    const matchesStatus = selectedStatus === "all" || idea.status === selectedStatus;
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'brainstorming':
        return 'bg-purple-100 text-purple-800';
      case 'researching':
        return 'bg-yellow-100 text-yellow-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (idea: any) => {
    setSelectedIdea(idea);
    setEditDialogOpen(true);
  };

  const handleReport = (idea: any) => {
    setSelectedIdea(idea);
    setReportDialogOpen(true);
  };

  const handleIdeaClick = (ideaId: string) => {
    navigate(`/experiment-ideas/${ideaId}/notes`);
  };

  const handleUpdateIdea = async (id: string, updates: any) => {
    await updateIdea.mutateAsync({ id, ...updates });
  };

  const handleAddIdea = async (idea: any) => {
    await createIdea.mutateAsync(idea);
  };

  const handleReorder = async (reorderedIdeas: any[]) => {
    const updates = reorderedIdeas.map((idea, index) => ({
      id: idea.id,
      display_order: index + 1
    }));
    await updateIdeaOrder.mutateAsync(updates);
  };

  if (isLoading) {
    return (
      <main className="flex-1 p-6 overflow-auto">
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
      </main>
    );
  }

  const renderIdeaCard = (idea: any) => (
    <Card 
      key={idea.id} 
      className="cursor-pointer hover:shadow-lg transition-shadow group relative"
      onClick={() => handleIdeaClick(idea.id)}
    >
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{idea.title}</CardTitle>
          <div className="flex gap-2">
            <Badge className={getPriorityColor(idea.priority)}>
              {idea.priority}
            </Badge>
            <Badge className={getStatusColor(idea.status)}>
              {idea.status}
            </Badge>
          </div>
        </div>
        <CardDescription className="line-clamp-2">
          <RichTextDisplay content={idea.description} maxLength={100} />
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Created {format(new Date(idea.created_at), 'MMM d, yyyy')}</span>
          </div>
          
          {idea.researcher && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{idea.researcher}</span>
            </div>
          )}
          
          {idea.experiment_number && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Hash className="h-4 w-4" />
              <span>Exp #{idea.experiment_number}</span>
            </div>
          )}
          
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(idea);
              }}
              className="flex-1"
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleReport(idea);
              }}
              className="flex-1"
            >
              Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Experiment Ideas</h1>
            <p className="text-gray-600 mt-1">Capture and organize your research ideas</p>
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
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Brainstorming</p>
                  <p className="text-2xl font-bold">
                    {ideas.filter(idea => idea.status === 'brainstorming').length}
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
                  <p className="text-sm text-gray-600">Researching</p>
                  <p className="text-2xl font-bold">
                    {ideas.filter(idea => idea.status === 'researching').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Ready</p>
                  <p className="text-2xl font-bold">
                    {ideas.filter(idea => idea.status === 'ready').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ideas Grid */}
        <DraggableGrid
          items={filteredIdeas}
          onReorder={handleReorder}
          renderItem={renderIdeaCard}
          droppableId="experiment-ideas"
        />

        {filteredIdeas.length === 0 && (
          <div className="text-center py-12">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedPriority !== "all" || selectedStatus !== "all"
                ? "Try adjusting your filters"
                : "Create your first experiment idea to get started"}
            </p>
            {!(searchTerm || selectedPriority !== "all" || selectedStatus !== "all") && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                Create Idea
              </Button>
            )}
          </div>
        )}

        <CreateIdeaDialog 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen}
        />
        
        {selectedIdea && (
          <>
            <EditIdeaDialog idea={selectedIdea} />
            <IdeaReportDialog ideaId={selectedIdea.id} ideaTitle={selectedIdea.title} />
          </>
        )}
      </div>
    </main>
  );
};

export default ExperimentIdeas;
