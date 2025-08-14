
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  FileText, 
  Calendar, 
  User, 
  Clock,
  Plus,
  Trash2,
  Eye,
  Loader2
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import CreateProtocolDialog from "@/components/CreateProtocolDialog";
import EditProtocolDialog from "@/components/EditProtocolDialog";
import DraggableGrid from "@/components/DraggableGrid";
import RichTextDisplay from "@/components/RichTextDisplay";
import { useProtocols, Protocol } from "@/hooks/useProtocols";
import { useToast } from "@/hooks/use-toast";

const Protocols = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [createProtocolOpen, setCreateProtocolOpen] = useState(false);
  const { toast } = useToast();
  
  const { protocols, isLoading, error, deleteProtocol, updateProtocolOrder } = useProtocols();

  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const filteredProtocols = protocols.filter(protocol => {
    const matchesSearch = protocol.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (protocol.description && stripHtmlTags(protocol.description).toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleProtocolClick = (protocolId: string) => {
    navigate(`/protocols/${protocolId}`);
  };

  const handleDeleteProtocol = async (protocolId: string) => {
    try {
      await deleteProtocol.mutateAsync(protocolId);
      toast({
        title: "Success",
        description: "Protocol deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting protocol:", error);
      toast({
        title: "Error",
        description: "Failed to delete protocol",
        variant: "destructive",
      });
    }
  };

  const handleReorder = async (reorderedProtocols: Protocol[]) => {
    try {
      const updates = reorderedProtocols.map((protocol, index) => ({
        id: protocol.id,
        display_order: index + 1
      }));

      await updateProtocolOrder.mutateAsync(updates);
    } catch (error) {
      console.error("Error updating protocol order:", error);
      toast({
        title: "Error",
        description: "Failed to update protocol order",
        variant: "destructive",
      });
    }
  };

  const renderProtocolCard = (protocol: Protocol) => (
    <Card key={protocol.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <FileText className="h-5 w-5 text-blue-600" />
            <CardTitle 
              className="text-lg cursor-pointer hover:text-blue-600"
              onClick={() => handleProtocolClick(protocol.id)}
            >
              {protocol.title}
            </CardTitle>
          </div>
          <div className="flex gap-1 items-center">
            <Badge variant="outline">{protocol.category}</Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleProtocolClick(protocol.id)}
              className="p-1 h-6 w-6"
            >
              <Eye className="h-3 w-3" />
            </Button>
            <EditProtocolDialog protocol={protocol} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 p-1 h-6 w-6">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Protocol</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{protocol.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteProtocol(protocol.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <div 
          className="text-sm text-gray-600 mt-2 cursor-pointer"
          onClick={() => handleProtocolClick(protocol.id)}
        >
          <RichTextDisplay 
            content={protocol.description || "No description"} 
            maxLength={100}
            className="text-sm"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span>Version {protocol.version}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>Created {new Date(protocol.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>Updated {new Date(protocol.updated_at).toLocaleDateString()}</span>
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
                <p className="text-red-600">Error loading protocols: {error.message}</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Protocols</h1>
                <p className="text-gray-600 mt-1">
                  Manage your research protocols and procedures
                </p>
              </div>
              <Button onClick={() => setCreateProtocolOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Protocol
              </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search protocols..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Protocols Grid */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                {filteredProtocols.length > 0 ? (
                  <DraggableGrid
                    items={filteredProtocols}
                    onReorder={handleReorder}
                    renderItem={renderProtocolCard}
                    droppableId="protocols"
                  />
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchTerm ? "No protocols found matching your criteria." : "No protocols found."}
                    </p>
                    <Button 
                      className="mt-4 gap-2" 
                      onClick={() => setCreateProtocolOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Create Your First Protocol
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      
      <CreateProtocolDialog 
        open={createProtocolOpen} 
        onOpenChange={setCreateProtocolOpen}
      />
    </div>
  );
};

export default Protocols;
