
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Search, Plus, Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useMiceOrders } from "@/hooks/useMiceOrders";
import AddMiceOrderDialog from "@/components/AddMiceOrderDialog";
import EditMiceOrderDialog from "@/components/EditMiceOrderDialog";
import { format } from "date-fns";

const MiceOrders = () => {
  const { orders, loading, addOrder, updateOrder, deleteOrder } = useMiceOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [addOrderOpen, setAddOrderOpen] = useState(false);
  const [editOrderOpen, setEditOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.strain_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.order_reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || order.order_status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-blue-600" />;
      case 'received':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order);
    setEditOrderOpen(true);
  };

  const handleUpdateOrder = async (id: string, updates: any) => {
    await updateOrder(id, updates);
    setEditOrderOpen(false);
    setSelectedOrder(null);
  };

  const handleAddOrder = async (order: any) => {
    await addOrder(order);
    setAddOrderOpen(false);
  };

  if (loading) {
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
            <h1 className="text-3xl font-bold">Mice Orders</h1>
            <p className="text-gray-600 mt-1">Track and manage your mice orders</p>
          </div>
          <Button onClick={() => setAddOrderOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
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
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.order_status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Shipped</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.order_status === 'shipped').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Received</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.order_status === 'received').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{order.strain_name}</CardTitle>
                  <Badge className={getStatusColor(order.order_status)}>
                    {order.order_status}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  Order Reference: {order.order_reference || 'N/A'}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {getStatusIcon(order.order_status)}
                    <span>Status: {order.order_status}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Ordered on {format(new Date(order.order_date), 'MMM d, yyyy')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="h-4 w-4" />
                    <span>Quantity: {order.quantity_ordered}</span>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditOrder(order)}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No mice orders found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedStatus !== "all"
                ? "Try adjusting your filters"
                : "Create your first mice order to get started"}
            </p>
            {!(searchTerm || selectedStatus !== "all") && (
              <Button onClick={() => setAddOrderOpen(true)}>
                Create Mice Order
              </Button>
            )}
          </div>
        )}

        <AddMiceOrderDialog 
          open={addOrderOpen}
          onOpenChange={setAddOrderOpen}
          onAddOrder={handleAddOrder}
        />
        
        {selectedOrder && (
          <EditMiceOrderDialog 
            open={editOrderOpen} 
            onOpenChange={setEditOrderOpen}
            order={selectedOrder}
            onUpdateOrder={handleUpdateOrder}
          />
        )}
      </div>
    </div>
  );
};

export default MiceOrders;
