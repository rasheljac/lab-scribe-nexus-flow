
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { InventoryItem } from "@/hooks/useInventoryItems";
import { Plus, Minus } from "lucide-react";

interface EditInventoryItemDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateItem: (id: string, updatedItem: Partial<InventoryItem>) => Promise<void>;
}

const EditInventoryItemDialog = ({ item, open, onOpenChange, onUpdateItem }: EditInventoryItemDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    supplier: "",
    current_stock: 0,
    unit: "",
    location: "",
    expiry_date: "",
    cost: "",
    url: "",
  });
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const [originalStock, setOriginalStock] = useState(0);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        supplier: item.supplier,
        current_stock: item.current_stock,
        unit: item.unit || "",
        location: item.location || "",
        expiry_date: item.expiry_date || "",
        cost: item.cost || "",
        url: item.url || "",
      });
      setOriginalStock(item.current_stock);
      setQuantityToAdd(1);
    }
  }, [item]);

  const handleQuantityChange = (increment: boolean) => {
    if (increment) {
      setQuantityToAdd(prev => prev + 1);
    } else {
      setQuantityToAdd(prev => Math.max(1, prev - 1));
    }
  };

  // Calculate the new stock level based on doubling for each quantity added (starting from quantity 2)
  const calculateNewStockLevel = () => {
    if (quantityToAdd === 1) return originalStock;
    
    let newStock = originalStock;
    for (let i = 1; i < quantityToAdd; i++) {
      newStock = newStock * 2;
    }
    return newStock;
  };

  const newStockLevel = calculateNewStockLevel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item) return;

    if (!formData.name || !formData.category || !formData.supplier) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const status = newStockLevel === 0 ? "out_of_stock" : "in_stock";

    try {
      await onUpdateItem(item.id, {
        ...formData,
        current_stock: newStockLevel,
        status,
      });

      onOpenChange(false);
      toast({
        title: "Success",
        description: `Item updated successfully${quantityToAdd > 1 ? ` - Stock doubled ${quantityToAdd - 1} time(s) from ${originalStock} to ${newStockLevel} ${formData.unit || 'units'}` : ''}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consumables">Consumables</SelectItem>
                  <SelectItem value="Chemicals">Chemicals</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Glassware">Glassware</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="box">Box</SelectItem>
                  <SelectItem value="pack">Pack</SelectItem>
                  <SelectItem value="kg">Kilogram</SelectItem>
                  <SelectItem value="g">Gram</SelectItem>
                  <SelectItem value="L">Liter</SelectItem>
                  <SelectItem value="mL">Milliliter</SelectItem>
                  <SelectItem value="piece">Piece</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_stock">Original Stock</Label>
              <Input
                id="current_stock"
                type="number"
                value={originalStock}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity_to_add">Quantity</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(false)}
                  disabled={quantityToAdd <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity_to_add"
                  type="number"
                  value={quantityToAdd}
                  onChange={(e) => setQuantityToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className="text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {quantityToAdd > 1 && (
                <p className="text-sm text-green-600">
                  New total: {newStockLevel} {formData.unit} (doubled {quantityToAdd - 1} time{quantityToAdd > 2 ? 's' : ''})
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                placeholder="$0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Purchase URL</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com/product"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Item</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditInventoryItemDialog;
