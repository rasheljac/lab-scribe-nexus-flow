import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Search, Plus, FolderOpen, Calendar, Hash, MoreVertical, Edit, Trash2, Beaker } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useExperiments } from "@/hooks/useExperiments";
import { useToast } from "@/hooks/use-toast";
import CreateProjectDialog from "@/components/CreateProjectDialog";
import EditProjectDialog from "@/components/EditProjectDialog";
import PaginatedDraggableGrid from "@/components/PaginatedDraggableGrid";
import RichTextDisplay from "@/components/RichTextDisplay";
import { format } from "date-fns";

const Projects = () => {
  const navigate = useNavigate();
  const { projects, isLoading, updateProject, updateProjectOrder, deleteProject } = useProjects();
  const { experiments } = useExperiments();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || project.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
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
      'research': 'bg-purple-100 text-purple-800',
      'development': 'bg-blue-100 text-blue-800',
      'collaboration': 'bg-green-100 text-green-800',
      'analysis': 'bg-red-100 text-red-800',
      'clinical': 'bg-yellow-100 text-yellow-800',
      'regulatory': 'bg-indigo-100 text-indigo-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getProjectExperimentCount = (projectId: string) => {
    return experiments.filter(experiment => experiment.project_id === projectId).length;
  };

  const handleReorder = async (reorderedProjects: any[]) => {
    const updates = reorderedProjects.map((project, index) => ({
      id: project.id,
      display_order: index + 1
    }));
    await updateProjectOrder.mutateAsync(updates);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      await deleteProject.mutateAsync(projectToDelete);
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleCardClick = (projectId: string, event: React.MouseEvent) => {
    // Prevent navigation if clicking on action buttons
    const target = event.target as HTMLElement;
    if (target.closest('[data-no-navigate]')) {
      return;
    }
    navigate(`/projects/${projectId}/experiments`);
  };

  const renderProjectCard = (project: any) => {
    const experimentCount = getProjectExperimentCount(project.id);
    
    return (
      <Card 
        key={project.id} 
        className="cursor-pointer hover:shadow-lg transition-shadow relative"
        onClick={(e) => handleCardClick(project.id, e)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg line-clamp-2 pr-2">{project.title}</CardTitle>
            <div className="flex items-center gap-2" data-no-navigate>
              <Badge className={getStatusColor(project.status)}>
                {project.status.replace('_', ' ')}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <EditProjectDialog project={project}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  </EditProjectDialog>
                  <DropdownMenuItem
                    className="text-red-600"
                    onSelect={() => {
                      setProjectToDelete(project.id);
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
              content={project.description || ""} 
              maxLength={150}
              className="text-sm"
            />
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={getCategoryColor(project.category)}>
                {project.category}
              </Badge>
            </div>
            
            {project.start_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Started {format(new Date(project.start_date), 'MMM d, yyyy')}</span>
              </div>
            )}

            {project.end_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Ends {format(new Date(project.end_date), 'MMM d, yyyy')}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Beaker className="h-4 w-4" />
              <span>{experimentCount} experiments</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const emptyState = (
    <div className="text-center py-12">
      <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
      <p className="text-gray-600 mb-4">
        {searchTerm || selectedStatus !== "all"
          ? "Try adjusting your filters"
          : "Create your first project to get started"}
      </p>
      {!(searchTerm || selectedStatus !== "all") && (
        <Button onClick={() => setCreateDialogOpen(true)}>
          New Project
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
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-gray-600 mt-1">Manage your research projects and track progress</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
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
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold">
                    {projects.filter(p => p.status === 'active').length}
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
                    {projects.filter(p => p.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Beaker className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Planning</p>
                  <p className="text-2xl font-bold">
                    {projects.filter(p => p.status === 'planning').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <PaginatedDraggableGrid
          items={filteredProjects}
          onReorder={handleReorder}
          renderItem={renderProjectCard}
          droppableId="projects"
          itemsPerPage={6}
          emptyState={emptyState}
          layout="grid"
        />

        <CreateProjectDialog 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this project? This action cannot be undone.
                All associated experiments and data will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteProject}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteProject.isPending}
              >
                {deleteProject.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Projects;
