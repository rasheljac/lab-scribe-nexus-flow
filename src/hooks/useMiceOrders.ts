
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface MiceOrder {
  id: string;
  user_id: string;
  strain_name: string;
  supplier: string;
  quantity_ordered: number;
  sex: string;
  age_weeks: number | null;
  order_date: string;
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  order_status: string;
  cost_per_mouse: number | null;
  total_cost: number | null;
  order_reference: string | null;
  special_requirements: string | null;
  housing_location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useMiceOrders = () => {
  const [orders, setOrders] = useState<MiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('mice_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching mice orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch mice orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (order: Omit<MiceOrder, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const insertData = {
        strain_name: order.strain_name,
        supplier: order.supplier,
        quantity_ordered: order.quantity_ordered,
        sex: order.sex,
        age_weeks: order.age_weeks,
        order_date: order.order_date,
        expected_delivery_date: order.expected_delivery_date,
        actual_delivery_date: order.actual_delivery_date,
        order_status: order.order_status,
        cost_per_mouse: order.cost_per_mouse,
        total_cost: order.total_cost,
        order_reference: order.order_reference,
        special_requirements: order.special_requirements,
        housing_location: order.housing_location,
        notes: order.notes,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('mice_orders')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      
      setOrders(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Mice order added successfully",
      });
      return data;
    } catch (error) {
      console.error('Error adding mice order:', error);
      toast({
        title: "Error",
        description: "Failed to add mice order",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateOrder = async (id: string, updates: Partial<MiceOrder>) => {
    try {
      const { data, error } = await supabase
        .from('mice_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setOrders(prev => prev.map(order => order.id === id ? data : order));
      toast({
        title: "Success",
        description: "Mice order updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating mice order:', error);
      toast({
        title: "Error",
        description: "Failed to update mice order",
        variant: "destructive",
      });
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('mice_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setOrders(prev => prev.filter(order => order.id !== id));
      toast({
        title: "Success",
        description: "Mice order deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting mice order:', error);
      toast({
        title: "Error",
        description: "Failed to delete mice order",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  return {
    orders,
    loading,
    addOrder,
    updateOrder,
    deleteOrder,
    refetch: fetchOrders
  };
};
