import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Plus, Lightbulb, Calendar, Hash, User, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useExperimentIdeas } from "@/hooks/useExperimentIdeas";
import { useToast } from "@/hooks/use-toast";
import CreateIdeaDialog from "@/components/CreateIdeaDialog";
import EditIdeaDialog from "@/components/EditIdeaDialog";
import PaginatedDraggableGrid from "@/components/PaginatedDraggableGrid";
import RichTextDisplay from "@/components/RichTextDisplay";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const ExperimentIdeas = () => {
  const { ideas, isLoading, updateIdeaOrder, deleteIdea } = useExperimentIdeas();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState<string | null>(null);

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
      case 'ready':
        return 'bg-purple-100 text-purple-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'researching':
        return 'bg-orange-100 text-orange-800';
      case 'brainstorming':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReorder = async (reorderedIdeas: any[]) => {
    const updates = reorderedIdeas.map((idea, index) => ({
      id: idea.id,
      display_order: index + 1
    }));
    await updateIdeaOrder.mutateAsync(updates);
  };

  const handleDeleteIdea = async () => {
    if (!ideaToDelete) return;
    
    try {
      await deleteIdea.mutateAsync(ideaToDelete);
      toast({
        title: "Success",
        description: "Experiment idea deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete experiment idea",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setIdeaToDelete(null);
    }
  };

  const handleIdeaClick = (ideaId: string) => {
    navigate(`/experiment-ideas/${ideaId}/notes`);
  };

  const renderIdeaCard = (idea: any) => (
    <Card 
      key={idea.id} 
      className="cursor-pointer hover:shadow-lg transition-shadow relative"
      onClick={() => handleIdeaClick(idea.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2 pr-2">{idea.title}</CardTitle>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Badge className={getPriorityColor(idea.priority)}>
              {idea.priority}
            </Badge>
            <Badge className={getStatusColor(idea.status)}>
              {idea.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <EditIdeaDialog idea={idea}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                </EditIdeaDialog>
                <DropdownMenuItem
                  className="text-red-600"
                  onSelect={() => {
                    setIdeaToDelete(idea.id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardDescription className="line-clamp-2">
          <RichTextDisplay 
            content={idea.description || ""} 
            maxLength={150}
            className="text-sm"
          />
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Hash className="h-4 w-4" />
            <span>{idea.category}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Created {format(new Date(idea.created_at), 'MMM d, yyyy')}</span>
          </div>
          
          {idea.estimated_duration && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Duration: {idea.estimated_duration}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const emptyState = (
    <div className="text-center py-12">
      <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No experiment ideas found</h3>
      <p className="text-gray-600 mb-4">
        {searchTerm || selectedPriority !== "all" || selectedStatus !== "all"
          ? "Try adjusting your filters"
          : "Create your first experiment idea to get started"}
      </p>
      {!(searchTerm || selectedPriority !== "all" || selectedStatus !== "all") && (
        <Button onClick={() => setCreateDialogOpen(true)}>
          New Idea
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
            <h1 className="text-3xl font-bold">Experiment Ideas</h1>
            <p className="text-gray-600 mt-1">Capture and organize your research ideas</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Idea
          </Button>
        </div>

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
              <SelectValue placeholder="All Priorities" />
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
              <SelectValue placeholder="All Statuses" />
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
                    {ideas.filter(i => i.status === 'brainstorming').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Researching</p>
                  <p className="text-2xl font-bold">
                    {ideas.filter(i => i.status === 'researching').length}
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
                    {ideas.filter(i => i.status === 'ready').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <PaginatedDraggableGrid
          items={filteredIdeas}
          onReorder={handleReorder}
          renderItem={renderIdeaCard}
          droppableId="experiment-ideas"
          itemsPerPage={6}
          emptyState={emptyState}
          layout="grid"
        />

        <CreateIdeaDialog 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Experiment Idea</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this experiment idea? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteIdea}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteIdea.isPending}
              >
                {deleteIdea.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ExperimentIdeas;
