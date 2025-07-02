
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
  release_date: string | null;
  order_status: string;
  order_reference: string | null;
  special_requirements: string | null;
  housing_location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  display_order: number;
}

export const useMiceOrders = () => {
  const [orders, setOrders] = useState<MiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOrders = async (page: number = 1, pageSize: number = 8) => {
    if (!user) return { data: [], count: 0 };
    
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('mice_orders')
        .select(`
          id,
          user_id,
          strain_name,
          supplier,
          quantity_ordered,
          sex,
          age_weeks,
          order_date,
          expected_delivery_date,
          actual_delivery_date,
          release_date,
          order_status,
          order_reference,
          special_requirements,
          housing_location,
          notes,
          created_at,
          updated_at,
          display_order
        `, { count: 'exact' })
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      // Add display_order if missing
      const ordersWithDisplayOrder = (data || []).map((order, index) => ({
        ...order,
        display_order: order.display_order ?? from + index
      }));

      setOrders(ordersWithDisplayOrder);
      setTotalCount(count || 0);
      return { data: ordersWithDisplayOrder, count: count || 0 };
    } catch (error) {
      console.error('Error fetching mice orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch mice orders",
        variant: "destructive",
      });
      return { data: [], count: 0 };
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (order: Omit<MiceOrder, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'display_order'>) => {
    if (!user) return;

    try {
      // Get the highest display_order
      const { data: maxOrderData } = await supabase
        .from('mice_orders')
        .select('display_order')
        .eq('user_id', user.id)
        .order('display_order', { ascending: false })
        .limit(1);

      const nextDisplayOrder = (maxOrderData?.[0]?.display_order ?? -1) + 1;

      const insertData = {
        strain_name: order.strain_name,
        supplier: order.supplier,
        quantity_ordered: order.quantity_ordered,
        sex: order.sex,
        age_weeks: order.age_weeks,
        order_date: order.order_date,
        expected_delivery_date: order.expected_delivery_date,
        actual_delivery_date: order.actual_delivery_date,
        release_date: order.release_date,
        order_status: order.order_status,
        order_reference: order.order_reference,
        special_requirements: order.special_requirements,
        housing_location: order.housing_location,
        notes: order.notes,
        user_id: user.id,
        display_order: nextDisplayOrder
      };

      const { data, error } = await supabase
        .from('mice_orders')
        .insert([insertData])
        .select(`
          id,
          user_id,
          strain_name,
          supplier,
          quantity_ordered,
          sex,
          age_weeks,
          order_date,
          expected_delivery_date,
          actual_delivery_date,
          release_date,
          order_status,
          order_reference,
          special_requirements,
          housing_location,
          notes,
          created_at,
          updated_at,
          display_order
        `)
        .single();

      if (error) throw error;
      
      setOrders(prev => [data, ...prev]);
      setTotalCount(prev => prev + 1);
      toast({
        title: "Success",
        description: "Mice order added successfully",
      });
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
        .select(`
          id,
          user_id,
          strain_name,
          supplier,
          quantity_ordered,
          sex,
          age_weeks,
          order_date,
          expected_delivery_date,
          actual_delivery_date,
          release_date,
          order_status,
          order_reference,
          special_requirements,
          housing_location,
          notes,
          created_at,
          updated_at,
          display_order
        `)
        .single();

      if (error) throw error;
      setOrders(prev => prev.map(order => order.id === id ? data : order));
      toast({
        title: "Success",
        description: "Mice order updated successfully",
      });
    } catch (error) {
      console.error('Error updating mice order:', error);
      toast({
        title: "Error",
        description: "Failed to update mice order",
        variant: "destructive",
      });
    }
  };

  const reorderOrders = async (reorderedOrders: MiceOrder[]) => {
    try {
      const updates = reorderedOrders.map((order, index) => ({
        id: order.id,
        display_order: index
      }));

      for (const update of updates) {
        await supabase
          .from('mice_orders')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      setOrders(reorderedOrders);
      toast({
        title: "Success",
        description: "Mice orders reordered successfully",
      });
    } catch (error) {
      console.error('Error reordering mice orders:', error);
      toast({
        title: "Error",
        description: "Failed to reorder mice orders",
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
      setTotalCount(prev => prev - 1);
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
    totalCount,
    addOrder,
    updateOrder,
    deleteOrder,
    reorderOrders,
    fetchOrders
  };
};
