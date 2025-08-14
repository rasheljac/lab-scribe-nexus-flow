
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  supplier: string;
  current_stock: number;
  unit: string;
  location: string;
  expiry_date: string | null;
  status: string;
  last_ordered: string | null;
  cost: string;
  url: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useInventoryItems = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchItems = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // Ensure all items have display_order, fallback to 0 if missing
      const itemsWithOrder = (data || []).map((item: any) => ({
        ...item,
        display_order: item.display_order ?? 0
      })) as InventoryItem[];
      
      setItems(itemsWithOrder);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'display_order'>) => {
    if (!user) return;

    try {
      // Get the next display order
      const { data: maxOrderData } = await supabase
        .from('inventory_items')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);

      const nextOrder = maxOrderData && maxOrderData.length > 0 
        ? ((maxOrderData[0] as any).display_order || 0) + 1 
        : 1;

      // Prepare the data for insertion, ensuring proper null handling
      const insertData = {
        name: item.name,
        category: item.category,
        supplier: item.supplier,
        current_stock: item.current_stock,
        unit: item.unit || null,
        location: item.location || null,
        expiry_date: item.expiry_date || null,
        status: item.status,
        last_ordered: item.last_ordered,
        cost: item.cost || null,
        url: item.url || null,
        user_id: user.id,
        display_order: nextOrder
      };

      console.log('Inserting item data:', insertData);

      const { data, error } = await supabase
        .from('inventory_items')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Ensure the returned data has display_order
      const newItem = {
        ...data,
        display_order: (data as any).display_order ?? nextOrder
      } as InventoryItem;
      
      setItems(prev => [...prev, newItem].sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
      return newItem;
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Ensure the returned data has display_order
      const updatedItem = {
        ...data,
        display_order: (data as any).display_order ?? 0
      } as InventoryItem;
      
      setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      return updatedItem;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive",
      });
    }
  };

  const updateItemOrder = async (updates: Array<{ id: string; display_order: number }>) => {
    try {
      // Use a type assertion to bypass the TypeScript type checking for the RPC call
      const { error } = await (supabase as any).rpc('update_inventory_display_order', {
        updates: updates
      });

      if (error) throw error;

      // Update local state
      setItems(prev => {
        const updatedItems = [...prev];
        updates.forEach(update => {
          const itemIndex = updatedItems.findIndex(item => item.id === update.id);
          if (itemIndex !== -1) {
            updatedItems[itemIndex] = { ...updatedItems[itemIndex], display_order: update.display_order };
          }
        });
        return updatedItems.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      });

      toast({
        title: "Success",
        description: "Item order updated successfully",
      });
    } catch (error) {
      console.error('Error updating item order:', error);
      toast({
        title: "Error",
        description: "Failed to update item order",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to delete inventory item",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  return {
    items,
    loading,
    addItem,
    updateItem,
    updateItemOrder,
    deleteItem,
    refetch: fetchItems
  };
};
