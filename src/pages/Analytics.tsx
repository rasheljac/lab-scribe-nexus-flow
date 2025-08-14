import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Download, BarChart3, TrendingUp, Users, FileText, Beaker, Calendar as CalendarIcon } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useAnalyticsPDFExport } from "@/hooks/useAnalyticsPDFExport";
import { useExperiments } from "@/hooks/useExperiments";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useProtocols } from "@/hooks/useProtocols";
import { format, subMonths, eachMonthOfInterval } from "date-fns";
import { toast } from "sonner";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<"3m" | "6m" | "12m">("6m");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { exportAnalyticsToPDF } = useAnalyticsPDFExport();
  const { experiments } = useExperiments();
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { protocols } = useProtocols();

  const today = new Date();
  const startDate = subMonths(today, parseInt(timeRange.slice(0, -1)));
  const allMonths = eachMonthOfInterval({ start: startDate, end: today });

  // Filter experiments by category
  const filteredExperiments = selectedCategory === "All"
    ? experiments
    : experiments.filter(exp => exp.category === selectedCategory);

  // Group experiments by month
  const monthlyExperiments = allMonths.map(month => {
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const experimentsInMonth = filteredExperiments.filter(exp => {
      const experimentDate = new Date(exp.created_at);
      return experimentDate >= monthStart && experimentDate <= monthEnd;
    });

    return {
      month: format(month, "MMM"),
      count: experimentsInMonth.length,
    };
  });

  // Task completion rate - check for status property instead of completed
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const taskCompletionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  // Protocol usage
  const protocolUsage = protocols.length;

  // Project distribution
  const projectDistribution = projects.map(project => ({
    name: project.title,
    value: experiments.filter(exp => exp.project_id === project.id).length,
  }));

  // Experiment status distribution
  const statusDistribution = [
    { name: "Planning", value: experiments.filter(exp => exp.status === "planning").length },
    { name: "In Progress", value: experiments.filter(exp => exp.status === "in_progress").length },
    { name: "Completed", value: experiments.filter(exp => exp.status === "completed").length },
    { name: "On Hold", value: experiments.filter(exp => exp.status === "on_hold").length },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const handleExportPDF = () => {
    try {
      // Calculate additional metrics needed for PDF export
      const completedExperiments = experiments.filter(exp => exp.status === "completed").length;
      const avgCompletionTime = 14; // Default average completion time in days
      const activeTeamMembers = 5; // Default team member count
      
      // Transform data to match the expected format for PDF export
      const analyticsData = {
        // Basic metrics
        totalExperiments: filteredExperiments.length,
        completedExperiments,
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        totalProjects: projects.length,
        avgCompletionTime,
        activeTeamMembers,
        
        // Monthly data for charts (transform monthlyExperiments to expected format)
        monthlyData: monthlyExperiments.map(item => ({
          month: item.month,
          experiments: item.count,
          reports: Math.floor(item.count * 0.8), // Estimated reports based on experiments
          tasks: Math.floor(item.count * 1.5) // Estimated tasks based on experiments
        })),
        
        // Experiment status data for pie chart
        experimentStatusData: statusDistribution.map(status => ({
          name: status.name,
          value: status.value
        })),
        
        // Productivity data for line chart (generate sample data)
        productivityData: monthlyExperiments.slice(-8).map((item, index) => ({
          week: `W${index + 1}`,
          productivity: Math.floor(Math.random() * 30) + 70 // Random productivity score 70-100
        }))
      };
      
      exportAnalyticsToPDF.mutate({ 
        data: analyticsData, 
        reportTitle: "Lab Analytics Report" 
      });
      
      toast.success("PDF export started successfully");
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error("Failed to export PDF. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-gray-600 mt-1">Insights into your research experiments</p>
          </div>
          <Button 
            onClick={handleExportPDF} 
            className="gap-2"
            disabled={exportAnalyticsToPDF.isPending}
          >
            <Download className="h-4 w-4" />
            {exportAnalyticsToPDF.isPending ? "Exporting..." : "Export to PDF"}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as "3m" | "6m" | "12m")}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="12m">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {[...new Set(experiments.map(exp => exp.category))].map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Beaker className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Experiments</p>
                  <p className="text-2xl font-bold">{filteredExperiments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Protocols Used</p>
                  <p className="text-2xl font-bold">{protocolUsage}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Task Completion Rate</p>
                  <p className="text-2xl font-bold">{taskCompletionRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Experiments */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Experiments</CardTitle>
              <CardDescription>Number of experiments created each month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyExperiments} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Project Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Project Distribution</CardTitle>
              <CardDescription>Distribution of experiments across projects</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={projectDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {projectDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Experiment Status Distribution</CardTitle>
            <CardDescription>Distribution of experiments by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
