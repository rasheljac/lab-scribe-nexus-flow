
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Loader2
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CreateTaskDialog from "@/components/CreateTaskDialog";
import TaskList from "@/components/TaskList";
import { useTasks, Task } from "@/hooks/useTasks";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 6;

const Tasks = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const { tasks, isLoading, error } = useTasks();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    const matchesCategory = filterCategory === "all" || task.category === filterCategory;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTasks = filteredTasks.slice(startIndex, endIndex);

  const handleMoveToPreviousPage = async (task: Task, currentIndex: number) => {
    if (currentPage === 1) return;
    
    try {
      setCurrentPage(currentPage - 1);
      toast({
        title: "Success",
        description: `Moved "${task.title}" to page ${currentPage - 1}`,
      });
    } catch (error) {
      console.error("Error moving task:", error);
      toast({
        title: "Error",
        description: "Failed to move task",
        variant: "destructive",
      });
    }
  };

  const handleMoveToNextPage = async (task: Task, currentIndex: number) => {
    if (currentPage === totalPages) return;
    
    try {
      setCurrentPage(currentPage + 1);
      toast({
        title: "Success",
        description: `Moved "${task.title}" to page ${currentPage + 1}`,
      });
    } catch (error) {
      console.error("Error moving task:", error);
      toast({
        title: "Error",
        description: "Failed to move task",
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
                <p className="text-red-600">Error loading tasks: {error.message}</p>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
                <p className="text-gray-600 mt-1">Organize and track your research tasks</p>
              </div>
              <CreateTaskDialog />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tasks..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="experiment">Experiment</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="quality-control">Quality Control</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {totalPages > 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <GripVertical className="h-4 w-4" />
                  <span className="text-sm">
                    <strong>Navigation:</strong> Use the arrow buttons to move tasks between pages for better organization.
                  </span>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {currentTasks.map((task, index) => (
                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {totalPages > 1 && (
                              <div className="flex items-center gap-1">
                                <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                                <ChevronLeft 
                                  className={`h-4 w-4 cursor-pointer transition-colors ${
                                    currentPage === 1 
                                      ? 'text-gray-300 cursor-not-allowed' 
                                      : 'text-blue-600 hover:text-blue-800'
                                  }`}
                                  onClick={() => currentPage > 1 && handleMoveToPreviousPage(task, index)}
                                />
                                <ChevronRight 
                                  className={`h-4 w-4 cursor-pointer transition-colors ${
                                    currentPage === totalPages 
                                      ? 'text-gray-300 cursor-not-allowed' 
                                      : 'text-blue-600 hover:text-blue-800'
                                  }`}
                                  onClick={() => currentPage < totalPages && handleMoveToNextPage(task, index)}
                                />
                              </div>
                            )}
                            {getStatusIcon(task.status)}
                            <CardTitle className="text-lg">{task.title}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{task.priority}</Badge>
                            <Badge variant="secondary">{task.status}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div 
                          className="text-gray-700 prose prose-sm max-w-none mb-4"
                          dangerouslySetInnerHTML={{ __html: task.description || 'No description' }}
                        />
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Assigned to: {task.assignee}</span>
                          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {currentTasks.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchTerm ? "No tasks found matching your search." : "No tasks found. Create your first task to get started."}
                    </p>
                  </div>
                )}

                {/* Pagination */}
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
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}
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

                {/* Items count */}
                <div className="text-center text-sm text-gray-500 mt-4">
                  Showing {Math.min(startIndex + 1, filteredTasks.length)} to {Math.min(endIndex, filteredTasks.length)} of {filteredTasks.length} tasks
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Tasks;
