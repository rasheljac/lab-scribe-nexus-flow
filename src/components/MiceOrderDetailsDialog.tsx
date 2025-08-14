
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, Calendar, FileText, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import RichTextDisplay from "@/components/RichTextDisplay";

interface MiceOrderDetailsDialogProps {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MiceOrderDetailsDialog = ({ order, open, onOpenChange }: MiceOrderDetailsDialogProps) => {
  if (!order) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl">{order.strain_name}</DialogTitle>
            <Badge className={getStatusColor(order.order_status)}>
              {getStatusIcon(order.order_status)}
              <span className="ml-1">{order.order_status}</span>
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Supplier</label>
                <p className="text-sm">{order.supplier}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Quantity Ordered</label>
                <p className="text-sm">{order.quantity_ordered}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Sex</label>
                <p className="text-sm capitalize">{order.sex}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Age at Order</label>
                <p className="text-sm">{order.age_weeks ? `${order.age_weeks} weeks` : 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Order Reference</label>
                <p className="text-sm">{order.order_reference || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Order Date</label>
                <p className="text-sm">{format(new Date(order.order_date), 'PPP')}</p>
              </div>
              {order.expected_delivery_date && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Expected Delivery</label>
                  <p className="text-sm">{format(new Date(order.expected_delivery_date), 'PPP')}</p>
                </div>
              )}
              {order.actual_delivery_date && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Actual Delivery</label>
                  <p className="text-sm">{format(new Date(order.actual_delivery_date), 'PPP')}</p>
                </div>
              )}
              {order.release_date && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Release Date</label>
                  <p className="text-sm">{format(new Date(order.release_date), 'PPP')}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Order Created</label>
                <p className="text-sm">{format(new Date(order.created_at), 'PPP')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Housing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Housing & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Housing Location</label>
                <p className="text-sm">{order.housing_location || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Status Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(order.order_status)}
                Status Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Current Status</label>
                <p className="text-sm capitalize">{order.order_status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                <p className="text-sm">{format(new Date(order.updated_at), 'PPP')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Special Requirements */}
        {order.special_requirements && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Special Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextDisplay content={order.special_requirements} />
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {order.notes && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextDisplay content={order.notes} />
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};
