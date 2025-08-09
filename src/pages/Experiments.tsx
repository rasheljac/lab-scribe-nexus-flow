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
  Beaker, 
  Calendar, 
  User, 
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Loader2,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CreateExperimentDialog from "@/components/CreateExperimentDialog";
import EditExperimentDialog from "@/components/EditExperimentDialog";
import DraggableGrid from "@/components/DraggableGrid";
import { useExperiments, Experiment } from "@/hooks/useExperiments";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 8;

const Experiments = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [createExperimentOpen, setCreateExperimentOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const { experiments, isLoading, error, deleteExperiment, updateExperimentOrder } = useExperiments();

  useEffect(() => {
    if (searchTerm) {
      setSearchParams({ search: searchTerm });
    } else {
      setSearchParams({});
    }
  }, [searchTerm, setSearchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCategory]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "planning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "on_hold":
        return <Pause className="h-4 w-4 text-gray-600" />;
      default:
        return <Beaker className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "planning":
        return "bg-yellow-100 text-yellow-800";
      case "on_hold":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const filteredExperiments = experiments.filter(experiment => {
    const matchesSearch = experiment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (experiment.description && stripHtmlTags(experiment.description).toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "all" || experiment.status === filterStatus;
    const matchesCategory = filterCategory === "all" || experiment.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = ["all", ...Array.from(new Set(experiments.map(e => e.category)))];

  // Calculate pagination
  const totalPages = Math.ceil(filteredExperiments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedExperiments = filteredExperiments.slice(startIndex, endIndex);

  const handleExperimentClick = (experimentId: string) => {
    navigate(`/experiments/${experimentId}/notes`);
  };

  const handleDeleteExperiment = async (experimentId: string, experimentTitle: string) => {
    try {
      await deleteExperiment.mutateAsync(experimentId);
      toast({
        title: "Success",
        description: `Experiment "${experimentTitle}" deleted successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete experiment",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enhanced reorder function with better cross-page support
  const handleReorder = async (reorderedItems: Experiment[]) => {
    try {
      // Calculate global positions for all reordered items
      const updates = reorderedItems.map((experiment, localIndex) => {
        const globalPosition = startIndex + localIndex + 1;
        return {
          id: experiment.id,
          display_order: globalPosition
        };
      });

      // Find items that were displaced and need their positions updated
      const reorderedIds = new Set(reorderedItems.map(item => item.id));
      const displacedUpdates: { id: string; display_order: number }[] = [];
      
      // Update positions for items that weren't in the reordered list
      filteredExperiments.forEach((experiment, globalIndex) => {
        if (!reorderedIds.has(experiment.id)) {
          const newPosition = globalIndex + 1;
          if (newPosition !== experiment.display_order) {
            displacedUpdates.push({
              id: experiment.id,
              display_order: newPosition
            });
          }
        }
      });

      // Combine all updates
      const allUpdates = [...updates, ...displacedUpdates];
      
      if (allUpdates.length > 0) {
        await updateExperimentOrder.mutateAsync(allUpdates);
        toast({
          title: "Success",
          description: `Updated order for ${allUpdates.length} experiment(s)`,
        });
      }
    } catch (error) {
      console.error("Error updating experiment order:", error);
      toast({
        title: "Error",
        description: "Failed to update experiment order",
        variant: "destructive",
      });
    }
  };

  const renderExperimentCard = (experiment: Experiment) => (
    <Card key={experiment.id} className="hover:shadow-md transition-shadow relative">
      <div className="absolute top-2 right-2 opacity-30 hover:opacity-70 transition-opacity">
        <ArrowUpDown className="h-4 w-4 text-gray-400" />
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            {getStatusIcon(experiment.status)}
            <CardTitle 
              className="text-lg cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => handleExperimentClick(experiment.id)}
            >
              {experiment.title}
            </CardTitle>
          </div>
          <div className="flex gap-1 items-center">
            <Badge className={getStatusColor(experiment.status)}>
              {experiment.status.replace('_', ' ')}
            </Badge>
            <EditExperimentDialog experiment={experiment} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 p-1 h-6 w-6">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Experiment</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{experiment.title}"? This action cannot be undone and will also delete all associated notes.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteExperiment(experiment.id, experiment.title)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        {experiment.description && (
          <p 
            className="text-sm text-gray-600 mt-2 cursor-pointer"
            onClick={() => handleExperimentClick(experiment.id)}
          >
            {stripHtmlTags(experiment.description)}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{experiment.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${experiment.progress}%` }}
            />
          </div>
        </div>

        {/* Experiment Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span>{experiment.researcher}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{experiment.start_date} - {experiment.end_date || "Ongoing"}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" />
            <span>{experiment.protocols} protocols, {experiment.samples} samples</span>
          </div>
        </div>

        {/* Category Badge */}
        <div className="pt-2">
          <Badge variant="outline">{experiment.category}</Badge>
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
                <p className="text-red-600">Error loading experiments: {error.message}</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Experiments</h1>
                <p className="text-gray-600 mt-1">Manage your experiments and track progress</p>
              </div>
              <Button onClick={() => setCreateExperimentOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Experiment
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search experiments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="capitalize">
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Enhanced Results Count with drag instructions */}
            {!isLoading && (
              <div className="flex items-center justify-between text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <div>
                  Showing {paginatedExperiments.length} of {filteredExperiments.length} experiments
                  {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>💡 Drag experiments to reorder them. Changes apply globally across all pages!</span>
                </div>
              </div>
            )}

            {/* Experiments Grid */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                {paginatedExperiments.length > 0 ? (
                  <DraggableGrid
                    items={paginatedExperiments}
                    onReorder={handleReorder}
                    renderItem={renderExperimentCard}
                    droppableId={`experiments-page-${currentPage}`}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Beaker className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchTerm || filterStatus !== "all" || filterCategory !== "all" 
                        ? "No experiments found matching your criteria." 
                        : "No experiments found. Create your first experiment to get started."
                      }
                    </p>
                    <Button 
                      className="mt-4 gap-2" 
                      onClick={() => setCreateExperimentOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Create First Experiment
                    </Button>
                  </div>
                )}

                {/* Enhanced Pagination with page navigation */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let page;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
      
      <CreateExperimentDialog 
        open={createExperimentOpen} 
        onOpenChange={setCreateExperimentOpen}
      />
    </div>
  );
};

export default Experiments;
