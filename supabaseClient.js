// supabaseClient.js - Supabase client configuration and API utilities

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Replace these with your actual Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

// Helper to transform Supabase UUID to simple integer ID for frontend
const transformId = (uuid) => uuid ? parseInt(uuid.split('-')[4], 16) : null;

// Helper to transform frontend ID back to UUID (for queries)
const toUUID = (id) => {
  if (!id) return null;
  // For demo: pad with zeros to create deterministic UUIDs
  const hex = id.toString(16).padStart(12, '0');
  return `00000000-0000-0000-0000-${hex}`;
};

// ─── CUSTOMERS API ───────────────────────────────────────────────────────────

export const customersAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(c => ({
      id: transformId(c.id),
      name: c.name,
      phone: c.phone,
      email: c.email || '',
      address: c.address || ''
    }));
  },

  async create(customer) {
    const { data, error } = await supabase
      .from('customers')
      .insert([{
        name: customer.name,
        phone: customer.phone,
        email: customer.email || null,
        address: customer.address || null
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: transformId(data.id),
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      address: data.address || ''
    };
  },

  async update(id, customer) {
    const uuid = toUUID(id);
    const { data, error } = await supabase
      .from('customers')
      .update({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || null,
        address: customer.address || null
      })
      .eq('id', uuid)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: transformId(data.id),
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      address: data.address || ''
    };
  },

  async delete(id) {
    const uuid = toUUID(id);
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', uuid);
    
    if (error) throw error;
  }
};

// ─── VEHICLES API ────────────────────────────────────────────────────────────

export const vehiclesAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(v => ({
      id: transformId(v.id),
      customerId: transformId(v.customer_id),
      make: v.make,
      model: v.model,
      year: v.year || '',
      plate: v.plate,
      color: v.color || ''
    }));
  },

  async create(vehicle) {
    const { data, error } = await supabase
      .from('vehicles')
      .insert([{
        customer_id: toUUID(vehicle.customerId),
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year || null,
        plate: vehicle.plate,
        color: vehicle.color || null
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: transformId(data.id),
      customerId: transformId(data.customer_id),
      make: data.make,
      model: data.model,
      year: data.year || '',
      plate: data.plate,
      color: data.color || ''
    };
  },

  async update(id, vehicle) {
    const uuid = toUUID(id);
    const { data, error } = await supabase
      .from('vehicles')
      .update({
        customer_id: toUUID(vehicle.customerId),
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year || null,
        plate: vehicle.plate,
        color: vehicle.color || null
      })
      .eq('id', uuid)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: transformId(data.id),
      customerId: transformId(data.customer_id),
      make: data.make,
      model: data.model,
      year: data.year || '',
      plate: data.plate,
      color: data.color || ''
    };
  },

  async delete(id) {
    const uuid = toUUID(id);
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', uuid);
    
    if (error) throw error;
  }
};

// ─── SERVICE ORDERS API ──────────────────────────────────────────────────────

export const ordersAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('service_orders')
      .select('*')
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    
    return data.map(o => ({
      id: transformId(o.id),
      vehicleId: transformId(o.vehicle_id),
      customerId: transformId(o.customer_id),
      status: o.status,
      startDate: o.start_date,
      endDate: o.end_date || null,
      paid: o.paid,
      notes: o.notes || '',
      services: o.services || []
    }));
  },

  async getActive() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('service_orders')
      .select('*')
      .or(`status.eq.Pending,status.eq.In Progress,and(status.eq.Completed,end_date.eq.${today})`)
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    
    return data.map(o => ({
      id: transformId(o.id),
      vehicleId: transformId(o.vehicle_id),
      customerId: transformId(o.customer_id),
      status: o.status,
      startDate: o.start_date,
      endDate: o.end_date || null,
      paid: o.paid,
      notes: o.notes || '',
      services: o.services || []
    }));
  },

  async getDailyLog() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('service_orders')
      .select('*')
      .eq('status', 'Completed')
      .lt('end_date', today)
      .order('end_date', { ascending: false });
    
    if (error) throw error;
    
    return data.map(o => ({
      id: transformId(o.id),
      vehicleId: transformId(o.vehicle_id),
      customerId: transformId(o.customer_id),
      status: o.status,
      startDate: o.start_date,
      endDate: o.end_date || null,
      paid: o.paid,
      notes: o.notes || '',
      services: o.services || []
    }));
  },

  async create(order) {
    const { data, error } = await supabase
      .from('service_orders')
      .insert([{
        vehicle_id: toUUID(order.vehicleId),
        customer_id: toUUID(order.customerId),
        status: order.status,
        start_date: order.startDate,
        end_date: order.endDate || null,
        paid: order.paid || false,
        notes: order.notes || null,
        services: order.services || []
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: transformId(data.id),
      vehicleId: transformId(data.vehicle_id),
      customerId: transformId(data.customer_id),
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date || null,
      paid: data.paid,
      notes: data.notes || '',
      services: data.services || []
    };
  },

  async update(id, order) {
    const uuid = toUUID(id);
    const { data, error } = await supabase
      .from('service_orders')
      .update({
        vehicle_id: toUUID(order.vehicleId),
        customer_id: toUUID(order.customerId),
        status: order.status,
        start_date: order.startDate,
        end_date: order.endDate || null,
        paid: order.paid || false,
        notes: order.notes || null,
        services: order.services || []
      })
      .eq('id', uuid)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: transformId(data.id),
      vehicleId: transformId(data.vehicle_id),
      customerId: transformId(data.customer_id),
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date || null,
      paid: data.paid,
      notes: data.notes || '',
      services: data.services || []
    };
  },

  async delete(id) {
    const uuid = toUUID(id);
    const { error } = await supabase
      .from('service_orders')
      .delete()
      .eq('id', uuid);
    
    if (error) throw error;
  },

  async togglePaid(id) {
    const uuid = toUUID(id);
    
    // First get current value
    const { data: current, error: getError } = await supabase
      .from('service_orders')
      .select('paid')
      .eq('id', uuid)
      .single();
    
    if (getError) throw getError;
    
    // Then toggle it
    const { data, error } = await supabase
      .from('service_orders')
      .update({ paid: !current.paid })
      .eq('id', uuid)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: transformId(data.id),
      vehicleId: transformId(data.vehicle_id),
      customerId: transformId(data.customer_id),
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date || null,
      paid: data.paid,
      notes: data.notes || '',
      services: data.services || []
    };
  }
};

// ─── REAL-TIME SUBSCRIPTIONS ─────────────────────────────────────────────────

export const subscribeToTable = (table, callback) => {
  const subscription = supabase
    .channel(`${table}_changes`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table }, 
      callback
    )
    .subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
};
