
import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, MousePointer2 } from "lucide-react";
import { useMiceOrders } from "@/hooks/useMiceOrders";
import AddMiceOrderDialog from "@/components/AddMiceOrderDialog";
import EditMiceOrderDialog from "@/components/EditMiceOrderDialog";
import { MiceOrder } from "@/hooks/useMiceOrders";

const MiceOrders = () => {
  const { orders, loading, addOrder, updateOrder, deleteOrder } = useMiceOrders();
  const [selectedOrder, setSelectedOrder] = useState<MiceOrder | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditOrder = (order: MiceOrder) => {
    setSelectedOrder(order);
    setIsEditDialogOpen(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      await deleteOrder(orderId);
    }
  };

  const handleAddOrder = async (order: Omit<MiceOrder, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await addOrder(order);
  };

  const handleUpdateOrder = async (id: string, updates: Partial<MiceOrder>) => {
    await updateOrder(id, updates);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <div className="text-center">Loading mice orders...</div>
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
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <MousePointer2 className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Mice Orders</h1>
              </div>
              <AddMiceOrderDialog onAddOrder={handleAddOrder} />
            </div>

            {orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MousePointer2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No mice orders yet</h3>
                  <p className="text-gray-500 mb-4">Start by creating your first mice order</p>
                  <AddMiceOrderDialog onAddOrder={handleAddOrder} />
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {orders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{order.strain_name}</CardTitle>
                        <Badge className={getStatusColor(order.order_status)}>
                          {order.order_status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div><strong>Supplier:</strong> {order.supplier}</div>
                        <div><strong>Quantity:</strong> {order.quantity_ordered}</div>
                        <div><strong>Sex:</strong> {order.sex}</div>
                        {order.age_weeks && <div><strong>Age:</strong> {order.age_weeks} weeks</div>}
                        <div><strong>Order Date:</strong> {new Date(order.order_date).toLocaleDateString()}</div>
                        {order.expected_delivery_date && (
                          <div><strong>Expected:</strong> {new Date(order.expected_delivery_date).toLocaleDateString()}</div>
                        )}
                        {order.actual_delivery_date && (
                          <div><strong>Delivered:</strong> {new Date(order.actual_delivery_date).toLocaleDateString()}</div>
                        )}
                        {order.release_date && (
                          <div><strong>Release Date:</strong> {new Date(order.release_date).toLocaleDateString()}</div>
                        )}
                        {order.housing_location && <div><strong>Housing:</strong> {order.housing_location}</div>}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEditOrder(order)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {selectedOrder && (
        <EditMiceOrderDialog
          order={selectedOrder}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onUpdateOrder={handleUpdateOrder}
        />
      )}
    </div>
  );
};

export default MiceOrders;
