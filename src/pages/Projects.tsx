import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  Plus,
  Trash2,
  Calendar,
  Loader2,
  Folder,
  Tag,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CreateProjectDialog from "@/components/CreateProjectDialog";
import EditProjectDialog from "@/components/EditProjectDialog";
import DraggableGrid from "@/components/DraggableGrid";
import { useProjects, Project } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 8;

const Projects = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { toast } = useToast();
  const { projects, isLoading, error, deleteProject, updateProjectOrder } = useProjects();

  useEffect(() => {
    if (searchTerm) {
      setSearchParams({ search: searchTerm });
    } else {
      setSearchParams({});
    }
  }, [searchTerm, setSearchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const categories = ["all", ...Array.from(new Set(projects.map(p => p.category)))];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    try {
      await deleteProject.mutateAsync(projectId);
      toast({
        title: "Success",
        description: `Project "${projectName}" deleted successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enhanced reorder function with better cross-page support
  const handleReorder = async (reorderedItems: any[]) => {
    try {
      // Calculate global positions for all reordered items
      const updates = reorderedItems.map((project, localIndex) => {
        const globalPosition = startIndex + localIndex + 1;
        return {
          id: project.id,
          display_order: globalPosition
        };
      });

      // Find items that were displaced and need their positions updated
      const reorderedIds = new Set(reorderedItems.map(item => item.id));
      const displacedUpdates: { id: string; display_order: number }[] = [];
      
      // Update positions for items that weren't in the reordered list
      filteredProjects.forEach((project, globalIndex) => {
        if (!reorderedIds.has(project.id)) {
          const newPosition = globalIndex + 1;
          if (newPosition !== project.display_order) {
            displacedUpdates.push({
              id: project.id,
              display_order: newPosition
            });
          }
        }
      });

      // Combine all updates
      const allUpdates = [...updates, ...displacedUpdates];
      
      if (allUpdates.length > 0) {
        await updateProjectOrder.mutateAsync(allUpdates);
        toast({
          title: "Success",
          description: `Updated order for ${allUpdates.length} project(s)`,
        });
      }
    } catch (error) {
      console.error("Error updating project order:", error);
      toast({
        title: "Error",
        description: "Failed to update project order",
        variant: "destructive",
      });
    }
  };

  // New function to move item to previous page
  const handleMoveToPreviousPage = async (project: any) => {
    if (currentPage === 1) return; // Can't move from first page
    
    try {
      const targetPageStartIndex = (currentPage - 2) * ITEMS_PER_PAGE;
      const targetPosition = targetPageStartIndex + ITEMS_PER_PAGE; // Place at end of previous page
      
      await updateProjectOrder.mutateAsync([{
        id: project.id,
        display_order: targetPosition
      }]);
      
      toast({
        title: "Success",
        description: `Moved "${project.title}" to page ${currentPage - 1}`,
      });
    } catch (error) {
      console.error("Error moving project:", error);
      toast({
        title: "Error",
        description: "Failed to move project",
        variant: "destructive",
      });
    }
  };

  // New function to move item to next page
  const handleMoveToNextPage = async (project: any) => {
    if (currentPage === totalPages) return; // Can't move from last page
    
    try {
      const targetPageStartIndex = currentPage * ITEMS_PER_PAGE;
      const targetPosition = targetPageStartIndex + 1; // Place at beginning of next page
      
      await updateProjectOrder.mutateAsync([{
        id: project.id,
        display_order: targetPosition
      }]);
      
      toast({
        title: "Success",
        description: `Moved "${project.title}" to page ${currentPage + 1}`,
      });
    } catch (error) {
      console.error("Error moving project:", error);
      toast({
        title: "Error",
        description: "Failed to move project",
        variant: "destructive",
      });
    }
  };

  const renderProjectCard = (project: any, index: number) => (
    <Card key={project.id} className="hover:shadow-md transition-shadow relative">
      <div className="absolute top-2 right-2 flex gap-1 opacity-30 hover:opacity-100 transition-opacity">
        <button
          onClick={() => handleMoveToPreviousPage(project)}
          disabled={currentPage === 1}
          className={`p-1 rounded hover:bg-gray-100 ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
          title={`Move to page ${currentPage - 1}`}
        >
          <ChevronLeft className="h-3 w-3 text-gray-600" />
        </button>
        <ArrowUpDown className="h-4 w-4 text-gray-400" />
        <button
          onClick={() => handleMoveToNextPage(project)}
          disabled={currentPage === totalPages}
          className={`p-1 rounded hover:bg-gray-100 ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
          title={`Move to page ${currentPage + 1}`}
        >
          <ChevronRight className="h-3 w-3 text-gray-600" />
        </button>
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Folder className="h-5 w-5 text-blue-600" />
            <CardTitle 
              className="text-lg cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => handleProjectClick(project.id)}
            >
              {project.title}
            </CardTitle>
          </div>
          <div className="flex gap-1 items-center">
            <Badge variant="outline" className="capitalize">
              {project.category}
            </Badge>
            <EditProjectDialog project={project} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 p-1 h-6 w-6">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Project</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{project.title}"? This action cannot be undone and will remove this project from all experiments and notes.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteProject(project.id, project.title)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        {project.description && (
          <p className="text-sm text-gray-600 mt-2">
            {project.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-400" />
            <span>{project.experiments_count} experiments, {project.protocols || 0} protocols</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-12">
                <p className="text-red-600">Error loading projects: {error.message}</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                <p className="text-gray-600 mt-1">
                  {projects.length} projects available
                </p>
              </div>
              <Button onClick={() => setCreateProjectOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Enhanced Results Count with drag instructions */}
            {!isLoading && (
              <div className="flex items-center justify-between text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <div>
                  Showing {Math.min(startIndex + 1, filteredProjects.length)} to {Math.min(endIndex, filteredProjects.length)} of {filteredProjects.length} projects
                  {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>💡 Drag projects to reorder them. Changes apply globally across all pages!</span>
                </div>
              </div>
            )}

            {/* Projects Grid */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                {currentProjects.length > 0 ? (
                  <DraggableGrid
                    items={currentProjects}
                    onReorder={handleReorder}
                    renderItem={renderProjectCard}
                    droppableId={`projects-page-${currentPage}`}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchTerm || selectedCategory !== "all" ? "No projects found matching your criteria." : "No projects found."}
                    </p>
                    <Button 
                      className="mt-4 gap-2" 
                      onClick={() => setCreateProjectOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Create First Project
                    </Button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      
      <CreateProjectDialog 
        open={createProjectOpen} 
        onOpenChange={setCreateProjectOpen}
      />
    </div>
  );
};

export default Projects;
