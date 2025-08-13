import React, { useState } from 'react';
import {
  Home,
  Beaker,
  FolderOpen,
  FileText,
  Lightbulb,
  CheckSquare,
  Calendar,
  Package,
  FileBarChart,
  BarChart3,
  Users,
  ShoppingCart,
  Mouse,
  Printer,
  MessageSquare,
  Phone,
  Video,
  Settings,
  Scale,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  };

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/", category: "main" },
    { icon: Beaker, label: "Experiments", path: "/experiments", category: "research" },
    { icon: FolderOpen, label: "Projects", path: "/projects", category: "research" },
    { icon: FileText, label: "Protocols", path: "/protocols", category: "research" },
    { icon: Lightbulb, label: "Experiment Ideas", path: "/experiment-ideas", category: "research" },
    { icon: CheckSquare, label: "Tasks", path: "/tasks", category: "management" },
    { icon: Calendar, label: "Calendar", path: "/calendar", category: "management" },
    { icon: Package, label: "Inventory", path: "/inventory", category: "management" },
    { icon: FileBarChart, label: "Reports", path: "/reports", category: "analysis" },
    { icon: BarChart3, label: "Analytics", path: "/analytics", category: "analysis" },
    { icon: Users, label: "Team", path: "/team", category: "management" },
    { icon: ShoppingCart, label: "Orders", path: "/orders", category: "management" },
    { icon: Mouse, label: "Mice Orders", path: "/mice-orders", category: "animals" },
    { icon: Scale, label: "Diet Cohorts", path: "/diet-cohorts", category: "animals" },
    { icon: Printer, label: "Label Printer", path: "/label-printer", category: "tools" },
    { icon: MessageSquare, label: "Messages", path: "/messages", category: "communication" },
    { icon: Phone, label: "SMS", path: "/sms", category: "communication" },
    { icon: Video, label: "Video Chat", path: "/video-chat", category: "communication" },
    { icon: Settings, label: "Settings", path: "/settings", category: "system" },
  ];

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full bg-secondary border-r z-50",
        isExpanded ? "w-64" : "w-16",
        "transition-all duration-300 ease-in-out"
      )}
    >
      {/* Top Section: App Name and Toggle Button */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className={cn("text-lg font-bold transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0")}>
          LMS
        </span>
        <button onClick={toggleSidebar} className="focus:outline-none">
          {isExpanded ? '❮' : '❯'}
        </button>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col h-[calc(100vh-120px)] justify-between">
        <div>
          {Object.entries(
            menuItems.reduce((acc: { [key: string]: any[] }, item) => {
              if (!acc[item.category]) {
                acc[item.category] = [];
              }
              acc[item.category].push(item);
              return acc;
            }, {})
          ).map(([category, items]) => (
            <div key={category} className="mb-4">
              <h3 className={cn("px-4 py-2 font-semibold text-sm uppercase transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0")}>
                {category}
              </h3>
              {items.map((item: any) => (
                <a
                  key={item.label}
                  href={item.path}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors duration-200",
                    location.pathname === item.path ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                    isExpanded ? "justify-start" : "justify-center"
                  )}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  <span className={cn("transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0")}>{item.label}</span>
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* User Profile and Sign Out */}
        <div className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar_url || ""} />
                  <AvatarFallback>{user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className={cn("text-sm font-medium transition-opacity duration-300", isExpanded ? "opacity-100" : "opacity-0")}>
                  {user?.first_name} {user?.last_name}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
