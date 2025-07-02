
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
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

  const addItem = async (item: Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
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
        user_id: user.id
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
      
      setItems(prev => [data, ...prev]);
      return data;
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
      setItems(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive",
      });
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
    deleteItem,
    refetch: fetchItems
  };
};
