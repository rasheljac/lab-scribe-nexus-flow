
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Package, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useInventoryItems } from "@/hooks/useInventoryItems";
import AddInventoryItemDialog from "@/components/AddInventoryItemDialog";
import EditInventoryItemDialog from "@/components/EditInventoryItemDialog";
import InventoryItemDetailsDialog from "@/components/InventoryItemDetailsDialog";

const Inventory = () => {
  const { items, isLoading, addItem, updateItem } = useInventoryItems();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "low_stock" && item.current_stock <= 10) ||
                         (selectedStatus === "in_stock" && item.current_stock > 10) ||
                         (selectedStatus === "out_of_stock" && item.current_stock === 0);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStockStatus = (item: any) => {
    if (item.current_stock === 0) return { status: 'out_of_stock', label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (item.current_stock <= 10) return { status: 'low_stock', label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'in_stock', label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'reagents': 'bg-blue-100 text-blue-800',
      'equipment': 'bg-purple-100 text-purple-800',
      'supplies': 'bg-green-100 text-green-800',
      'samples': 'bg-orange-100 text-orange-800',
      'media': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const categories = Array.from(new Set(items.map(item => item.category)));

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setDetailsDialogOpen(true);
  };

  const handleUpdateItem = async (id: string, updates: any) => {
    await updateItem(id, updates);
    window.location.reload();
  };

  const handleAddItem = async (item: any) => {
    await addItem(item);
  };

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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Inventory</h1>
            <p className="text-gray-600 mt-1">Track and manage your lab inventory</p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search inventory..."
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
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">In Stock</p>
                  <p className="text-2xl font-bold">
                    {items.filter(item => item.current_stock > 10).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold">
                    {items.filter(item => item.current_stock <= 10 && item.current_stock > 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold">
                    {items.filter(item => item.current_stock === 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const stockStatus = getStockStatus(item);
            
            return (
              <Card key={item.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader 
                  onClick={() => handleViewDetails(item)}
                  className="pb-3"
                >
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{item.name}</CardTitle>
                    <Badge className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.current_stock} {item.unit}</span>
                        <Badge className={stockStatus.color}>
                          {stockStatus.label}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Min. Quantity:</span>
                      <span className="font-medium">10 {item.unit}</span>
                    </div>
                    
                    {item.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Location:</span>
                        <span className="font-medium">{item.location}</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item);
                        }}
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(item)}
                        className="flex-1"
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                ? "Try adjusting your filters"
                : "Add your first inventory item to get started"}
            </p>
            {!(searchTerm || selectedCategory !== "all" || selectedStatus !== "all") && (
              <Button onClick={() => setAddDialogOpen(true)}>
                Add Item
              </Button>
            )}
          </div>
        )}

        <AddInventoryItemDialog 
          onAddItem={handleAddItem}
        />
        
        {selectedItem && (
          <>
            <EditInventoryItemDialog 
              open={editDialogOpen} 
              onOpenChange={setEditDialogOpen}
              item={selectedItem}
              onUpdateItem={handleUpdateItem}
            />
            
            <InventoryItemDetailsDialog 
              open={detailsDialogOpen} 
              onOpenChange={setDetailsDialogOpen}
              item={selectedItem}
              onEdit={handleEdit}
              onOrder={() => {}}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Inventory;
