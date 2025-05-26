
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Loader2,
  Trash2
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CreateExperimentDialog from "@/components/CreateExperimentDialog";
import EditExperimentDialog from "@/components/EditExperimentDialog";
import { useExperiments } from "@/hooks/useExperiments";
import { useToast } from "@/hooks/use-toast";

const Experiments = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const { toast } = useToast();

  const { experiments, isLoading, error, deleteExperiment } = useExperiments();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "planning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredExperiments = experiments.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (exp.description && exp.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "all" || exp.status === filterStatus;
    const matchesCategory = filterCategory === "all" || exp.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleExperimentClick = (experimentId: string) => {
    navigate(`/experiments/${experimentId}/notes`);
  };

  const handleDeleteExperiment = async (experimentId: string) => {
    try {
      await deleteExperiment.mutateAsync(experimentId);
      toast({
        title: "Success",
        description: "Experiment deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting experiment:", error);
      toast({
        title: "Error",
        description: "Failed to delete experiment",
        variant: "destructive",
      });
    }
  };

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
                <h1 className="text-3xl font-bold text-gray-900">Laboratory Experiments</h1>
                <p className="text-gray-600 mt-1">Track and manage your research experiments</p>
              </div>
              <CreateExperimentDialog />
            </div>

            {/* Filters */}
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
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="materials">Materials</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Experiments Grid */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredExperiments.map((experiment) => (
                  <Card key={experiment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          {getStatusIcon(experiment.status)}
                          <CardTitle 
                            className="text-lg cursor-pointer hover:text-blue-600"
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
                                  onClick={() => handleDeleteExperiment(experiment.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <p 
                        className="text-sm text-gray-600 mt-2 cursor-pointer"
                        onClick={() => handleExperimentClick(experiment.id)}
                      >
                        {experiment.description}
                      </p>
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
                ))}
                {filteredExperiments.length === 0 && !isLoading && (
                  <div className="col-span-full text-center py-12">
                    <Beaker className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No experiments found. Create your first experiment to get started.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Experiments;
