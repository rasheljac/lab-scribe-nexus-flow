
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Experiments from "./pages/Experiments";
import ExperimentDetails from "./pages/ExperimentDetails";
import ExperimentNotes from "./pages/ExperimentNotes";
import Projects from "./pages/Projects";
import ProjectExperiments from "./pages/ProjectExperiments";
import Calendar from "./pages/Calendar";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Inventory from "./pages/Inventory";
import LabelPrinter from "./pages/LabelPrinter";
import Orders from "./pages/Orders";
import MiceOrders from "./pages/MiceOrders";
import Messages from "./pages/Messages";
import VideoChat from "./pages/VideoChat";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import ExperimentIdeas from "./pages/ExperimentIdeas";
import IdeaNotes from "./pages/IdeaNotes";
import Protocols from "./pages/Protocols";
import ProtocolDetails from "./pages/ProtocolDetails";
import Auth from "./pages/Auth";
import Users from "./pages/Users";
import SystemSettings from "./pages/SystemSettings";
import SMS from "./pages/SMS";
import DietCohorts from "./pages/DietCohorts";
import NotFound from "./pages/NotFound";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <div className="flex h-screen bg-gray-50">
                  <Sidebar />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-auto">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/experiments" element={<Experiments />} />
                        <Route path="/experiments/:id" element={<ExperimentDetails />} />
                        <Route path="/experiments/:experimentId/notes" element={<ExperimentNotes />} />
                        <Route path="/experiment-ideas" element={<ExperimentIdeas />} />
                        <Route path="/experiment-ideas/:ideaId/notes" element={<IdeaNotes />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/projects/:projectId/experiments" element={<ProjectExperiments />} />
                        <Route path="/protocols" element={<Protocols />} />
                        <Route path="/protocols/:id" element={<ProtocolDetails />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/labels" element={<LabelPrinter />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/mice-orders" element={<MiceOrders />} />
                        <Route path="/diet-cohorts" element={<DietCohorts />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/sms" element={<SMS />} />
                        <Route path="/video-chat" element={<VideoChat />} />
                        <Route path="/team" element={<Team />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/admin/users" element={<Users />} />
                        <Route path="/admin/settings" element={<SystemSettings />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
