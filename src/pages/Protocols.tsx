
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, FileText, Calendar, User, Hash } from "lucide-react";
import { useProtocols } from "@/hooks/useProtocols";
import CreateProtocolDialog from "@/components/CreateProtocolDialog";
import PaginatedDraggableGrid from "@/components/PaginatedDraggableGrid";
import RichTextDisplay from "@/components/RichTextDisplay";
import { format } from "date-fns";

const Protocols = () => {
  const navigate = useNavigate();
  const { protocols, isLoading, updateProtocolOrder } = useProtocols();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const filteredProtocols = protocols.filter(protocol => {
    const matchesSearch = protocol.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         protocol.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || protocol.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(protocols.map(p => p.category))).filter(Boolean);

  const handleReorder = async (reorderedProtocols: any[]) => {
    const updates = reorderedProtocols.map((protocol, index) => ({
      id: protocol.id,
      display_order: index + 1
    }));
    await updateProtocolOrder.mutateAsync(updates);
  };

  const renderProtocolCard = (protocol: any) => (
    <Card 
      key={protocol.id} 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/protocols/${protocol.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{protocol.title}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">
              v{protocol.version}
            </Badge>
            {protocol.is_template && (
              <Badge variant="secondary">
                Template
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="line-clamp-2">
          <RichTextDisplay 
            content={protocol.description || ""} 
            maxLength={150}
            className="text-sm"
          />
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Hash className="h-4 w-4" />
            <span>{protocol.category}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Created {format(new Date(protocol.created_at), 'MMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Updated {format(new Date(protocol.updated_at), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const emptyState = (
    <div className="text-center py-12">
      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No protocols found</h3>
      <p className="text-gray-600 mb-4">
        {searchTerm || selectedCategory !== "all"
          ? "Try adjusting your filters"
          : "Create your first protocol to get started"}
      </p>
      {!(searchTerm || selectedCategory !== "all") && (
        <Button onClick={() => setCreateDialogOpen(true)}>
          Create Protocol
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
            <h1 className="text-3xl font-bold">Protocols</h1>
            <p className="text-gray-600 mt-1">Manage your research protocols</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Protocol
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search protocols..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{protocols.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Templates</p>
                  <p className="text-2xl font-bold">
                    {protocols.filter(p => p.is_template).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">
                    {protocols.filter(p => {
                      const createdDate = new Date(p.created_at);
                      const thisMonth = new Date();
                      return createdDate.getMonth() === thisMonth.getMonth() && 
                             createdDate.getFullYear() === thisMonth.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <PaginatedDraggableGrid
          items={filteredProtocols}
          onReorder={handleReorder}
          renderItem={renderProtocolCard}
          droppableId="protocols"
          itemsPerPage={6}
          emptyState={emptyState}
        />

        <CreateProtocolDialog 
          open={createDialogOpen} 
          onOpenChange={setCreateDialogOpen}
        />
      </div>
    </div>
  );
};

export default Protocols;
