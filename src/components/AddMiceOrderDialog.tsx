
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MiceOrder } from "@/hooks/useMiceOrders";

interface AddMiceOrderDialogProps {
  onAddOrder: (order: Omit<MiceOrder, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

const AddMiceOrderDialog = ({ onAddOrder }: AddMiceOrderDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    strain_name: "",
    supplier: "",
    quantity_ordered: 1,
    sex: "",
    age_weeks: "",
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: "",
    actual_delivery_date: "",
    order_status: "pending",
    cost_per_mouse: "",
    total_cost: "",
    order_reference: "",
    special_requirements: "",
    housing_location: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.strain_name || !formData.supplier || !formData.sex) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await onAddOrder({
        strain_name: formData.strain_name,
        supplier: formData.supplier,
        quantity_ordered: formData.quantity_ordered,
        sex: formData.sex,
        age_weeks: formData.age_weeks ? parseInt(formData.age_weeks) : null,
        order_date: formData.order_date,
        expected_delivery_date: formData.expected_delivery_date || null,
        actual_delivery_date: formData.actual_delivery_date || null,
        order_status: formData.order_status,
        cost_per_mouse: formData.cost_per_mouse ? parseFloat(formData.cost_per_mouse) : null,
        total_cost: formData.total_cost ? parseFloat(formData.total_cost) : null,
        order_reference: formData.order_reference || null,
        special_requirements: formData.special_requirements || null,
        housing_location: formData.housing_location || null,
        notes: formData.notes || null,
      });

      setFormData({
        strain_name: "",
        supplier: "",
        quantity_ordered: 1,
        sex: "",
        age_weeks: "",
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: "",
        actual_delivery_date: "",
        order_status: "pending",
        cost_per_mouse: "",
        total_cost: "",
        order_reference: "",
        special_requirements: "",
        housing_location: "",
        notes: "",
      });
      setOpen(false);
    } catch (error) {
      console.error('Error adding mice order:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Mice Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Mice Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="strain_name">Strain Name *</Label>
              <Input
                id="strain_name"
                value={formData.strain_name}
                onChange={(e) => setFormData(prev => ({ ...prev, strain_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity_ordered">Quantity</Label>
              <Input
                id="quantity_ordered"
                type="number"
                min="1"
                value={formData.quantity_ordered}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity_ordered: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sex *</Label>
              <Select value={formData.sex} onValueChange={(value) => setFormData(prev => ({ ...prev, sex: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age_weeks">Age (weeks)</Label>
              <Input
                id="age_weeks"
                type="number"
                min="0"
                value={formData.age_weeks}
                onChange={(e) => setFormData(prev => ({ ...prev, age_weeks: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order_date">Order Date</Label>
              <Input
                id="order_date"
                type="date"
                value={formData.order_date}
                onChange={(e) => setFormData(prev => ({ ...prev, order_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected_delivery_date">Expected Delivery</Label>
              <Input
                id="expected_delivery_date"
                type="date"
                value={formData.expected_delivery_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_delivery_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost_per_mouse">Cost per Mouse ($)</Label>
              <Input
                id="cost_per_mouse"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_per_mouse}
                onChange={(e) => setFormData(prev => ({ ...prev, cost_per_mouse: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_cost">Total Cost ($)</Label>
              <Input
                id="total_cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.total_cost}
                onChange={(e) => setFormData(prev => ({ ...prev, total_cost: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order_reference">Order Reference</Label>
              <Input
                id="order_reference"
                value={formData.order_reference}
                onChange={(e) => setFormData(prev => ({ ...prev, order_reference: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="housing_location">Housing Location</Label>
              <Input
                id="housing_location"
                value={formData.housing_location}
                onChange={(e) => setFormData(prev => ({ ...prev, housing_location: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_requirements">Special Requirements</Label>
            <Textarea
              id="special_requirements"
              value={formData.special_requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, special_requirements: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Order</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMiceOrderDialog;
