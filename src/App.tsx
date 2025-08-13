
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster"
import { queryClient } from "@/lib/react-query";

import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Experiments from "./pages/Experiments";
import ExperimentDetails from "./pages/ExperimentDetails";
import ExperimentNotes from "./pages/ExperimentNotes";
import Projects from "./pages/Projects";
import ProjectExperiments from "./pages/ProjectExperiments";
import Protocols from "./pages/Protocols";
import ProtocolDetails from "./pages/ProtocolDetails";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Team from "./pages/Team";
import Orders from "./pages/Orders";
import MiceOrders from "./pages/MiceOrders";
import IdeaNotes from "./pages/IdeaNotes";
import ExperimentIdeas from "./pages/ExperimentIdeas";
import LabelPrinter from "./pages/LabelPrinter";
import Messages from "./pages/Messages";
import SMS from "./pages/SMS";
import VideoChat from "./pages/VideoChat";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import SystemSettings from "./pages/SystemSettings";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DietCohorts from "./pages/DietCohorts";

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <div className="flex-1 ml-64">
                    <Header />
                    <main className="pt-16">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/experiments" element={<Experiments />} />
                        <Route path="/experiments/:id" element={<ExperimentDetails />} />
                        <Route path="/experiments/:id/notes" element={<ExperimentNotes />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/projects/:id/experiments" element={<ProjectExperiments />} />
                        <Route path="/protocols" element={<Protocols />} />
                        <Route path="/protocols/:id" element={<ProtocolDetails />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/team" element={<Team />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/mice-orders" element={<MiceOrders />} />
                        <Route path="/diet-cohorts" element={<DietCohorts />} />
                        <Route path="/idea-notes/:ideaId" element={<IdeaNotes />} />
                        <Route path="/experiment-ideas" element={<ExperimentIdeas />} />
                        <Route path="/label-printer" element={<LabelPrinter />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/sms" element={<SMS />} />
                        <Route path="/video-chat" element={<VideoChat />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/system-settings" element={<SystemSettings />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
        <Toaster />
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
