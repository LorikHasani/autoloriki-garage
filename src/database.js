// database.js - Smart Database Wrapper
// Automatically uses Supabase if configured, falls back to localStorage
// This makes your app work in development AND production without code changes

import { supabase } from "../supabaseClient.js";

// Auto-detect if Supabase is properly configured
const USE_SUPABASE = (() => {
  try {
    const url = "https://jwsaoudgkssipeeiiind.supabase.co";
    const key =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3c2FvdWRna3NzaXBlZWlpaW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDg1ODksImV4cCI6MjA4NTg4NDU4OX0.ZPaPsqZDrowY2wfjEaXEinkIpbNdoHTjZj6-NiMhA-I";
    return (
      url &&
      key &&
      url !== "YOUR_SUPABASE_URL" &&
      url !== "your-project-url.supabase.co" &&
      !url.includes("example")
    );
  } catch {
    return false;
  }
})();

console.log(
  `🗄️  Database Mode: ${USE_SUPABASE ? "Supabase (Cloud)" : "localStorage (Local)"}`,
);

// Helper: Generate simple integer ID for localStorage
const generateId = () => Date.now();

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOMERS DATABASE
// ═══════════════════════════════════════════════════════════════════════════

export const customersDB = {
  async getAll() {
    if (!USE_SUPABASE) {
      const data = localStorage.getItem("garazh_customers");
      return data ? JSON.parse(data) : [];
    }

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Keep UUID as id (as string)
    return data.map((c) => ({
      id: c.id, // Keep as UUID string
      name: c.name,
      phone: c.phone,
      email: c.email || "",
      address: c.address || "",
    }));
  },

  async create(customer) {
    if (!USE_SUPABASE) {
      const all = await this.getAll();
      const newCustomer = { ...customer, id: generateId() };
      localStorage.setItem(
        "garazh_customers",
        JSON.stringify([...all, newCustomer]),
      );
      return newCustomer;
    }

    const { data, error } = await supabase
      .from("customers")
      .insert([
        {
          name: customer.name,
          phone: customer.phone,
          email: customer.email || null,
          address: customer.address || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id, // UUID string
      name: data.name,
      phone: data.phone,
      email: data.email || "",
      address: data.address || "",
    };
  },

  async update(id, customer) {
    if (!USE_SUPABASE) {
      const all = await this.getAll();
      const updated = all.map((c) => (c.id === id ? { ...c, ...customer } : c));
      localStorage.setItem("garazh_customers", JSON.stringify(updated));
      return { id, ...customer };
    }

    const { data, error } = await supabase
      .from("customers")
      .update({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || null,
        address: customer.address || null,
      })
      .eq("id", id) // id is already UUID string
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      email: data.email || "",
      address: data.address || "",
    };
  },

  async delete(id) {
    if (!USE_SUPABASE) {
      const all = await this.getAll();
      const updated = all.filter((c) => c.id !== id);
      localStorage.setItem("garazh_customers", JSON.stringify(updated));
      return;
    }

    const { error } = await supabase.from("customers").delete().eq("id", id); // id is already UUID string

    if (error) throw error;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// VEHICLES DATABASE
// ═══════════════════════════════════════════════════════════════════════════

export const vehiclesDB = {
  async getAll() {
    if (!USE_SUPABASE) {
      const data = localStorage.getItem("garazh_vehicles");
      return data ? JSON.parse(data) : [];
    }

    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((v) => ({
      id: v.id, // UUID string
      customerId: v.customer_id, // UUID string
      make: v.make,
      model: v.model,
      year: v.year || "",
      plate: v.plate,
      vin: v.vin || "",
      color: v.color || "",
    }));
  },

  async create(vehicle) {
    if (!USE_SUPABASE) {
      const all = await this.getAll();
      const newVehicle = { ...vehicle, id: generateId() };
      localStorage.setItem(
        "garazh_vehicles",
        JSON.stringify([...all, newVehicle]),
      );
      return newVehicle;
    }

    const { data, error } = await supabase
      .from("vehicles")
      .insert([
        {
          customer_id: vehicle.customerId, // UUID string
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year || null,
          plate: vehicle.plate,
          vin: vehicle.vin || null,
          color: vehicle.color || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      customerId: data.customer_id,
      make: data.make,
      model: data.model,
      year: data.year || "",
      plate: data.plate,
      vin: data.vin || "",
      color: data.color || "",
    };
  },

  async update(id, vehicle) {
    if (!USE_SUPABASE) {
      const all = await this.getAll();
      const updated = all.map((v) => (v.id === id ? { ...v, ...vehicle } : v));
      localStorage.setItem("garazh_vehicles", JSON.stringify(updated));
      return { id, ...vehicle };
    }

    const { data, error } = await supabase
      .from("vehicles")
      .update({
        customer_id: vehicle.customerId,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year || null,
        plate: vehicle.plate,
        vin: vehicle.vin || null,
        color: vehicle.color || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      customerId: data.customer_id,
      make: data.make,
      model: data.model,
      year: data.year || "",
      plate: data.plate,
      vin: data.vin || "",
      color: data.color || "",
    };
  },

  async delete(id) {
    if (!USE_SUPABASE) {
      const all = await this.getAll();
      const updated = all.filter((v) => v.id !== id);
      localStorage.setItem("garazh_vehicles", JSON.stringify(updated));
      return;
    }

    const { error } = await supabase.from("vehicles").delete().eq("id", id);

    if (error) throw error;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ORDERS DATABASE
// ═══════════════════════════════════════════════════════════════════════════

export const ordersDB = {
  async getAll() {
    if (!USE_SUPABASE) {
      const data = localStorage.getItem("garazh_orders");
      return data ? JSON.parse(data) : [];
    }

    const { data, error } = await supabase
      .from("service_orders")
      .select("*")
      .order("start_date", { ascending: false });

    if (error) throw error;

    return data.map((o) => ({
      id: o.id, // UUID string
      vehicleId: o.vehicle_id, // UUID string
      customerId: o.customer_id, // UUID string
      status: o.status,
      startDate: o.start_date,
      endDate: o.end_date || null,
      paid: o.paid,
      notes: o.notes || "",
      services: o.services || [],
    }));
  },

  async create(order) {
    if (!USE_SUPABASE) {
      const all = await this.getAll();
      const newOrder = { ...order, id: generateId() };
      localStorage.setItem("garazh_orders", JSON.stringify([...all, newOrder]));
      return newOrder;
    }

    const { data, error } = await supabase
      .from("service_orders")
      .insert([
        {
          vehicle_id: order.vehicleId,
          customer_id: order.customerId,
          status: order.status,
          start_date: order.startDate,
          end_date: order.endDate || null,
          paid: order.paid || false,
          notes: order.notes || null,
          services: order.services || [],
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      vehicleId: data.vehicle_id,
      customerId: data.customer_id,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date || null,
      paid: data.paid,
      notes: data.notes || "",
      services: data.services || [],
    };
  },

  async update(id, order) {
    if (!USE_SUPABASE) {
      const all = await this.getAll();
      const updated = all.map((o) => (o.id === id ? { ...o, ...order } : o));
      localStorage.setItem("garazh_orders", JSON.stringify(updated));
      return { id, ...order };
    }

    const { data, error } = await supabase
      .from("service_orders")
      .update({
        vehicle_id: order.vehicleId,
        customer_id: order.customerId,
        status: order.status,
        start_date: order.startDate,
        end_date: order.endDate || null,
        paid: order.paid || false,
        notes: order.notes || null,
        services: order.services || [],
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      vehicleId: data.vehicle_id,
      customerId: data.customer_id,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date || null,
      paid: data.paid,
      notes: data.notes || "",
      services: data.services || [],
    };
  },

  async delete(id) {
    if (!USE_SUPABASE) {
      const all = await this.getAll();
      const updated = all.filter((o) => o.id !== id);
      localStorage.setItem("garazh_orders", JSON.stringify(updated));
      return;
    }

    const { error } = await supabase
      .from("service_orders")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const dbUtils = {
  // Test database connection
  async testConnection() {
    if (!USE_SUPABASE) {
      return {
        success: true,
        mode: "localStorage",
        message: "Using local storage",
      };
    }

    try {
      const { data, error } = await supabase
        .from("customers")
        .select("count")
        .limit(1);

      if (error) throw error;

      return {
        success: true,
        mode: "Supabase",
        message: "Connected to Supabase",
      };
    } catch (error) {
      return { success: false, mode: "Supabase", message: error.message };
    }
  },

  // Get current mode
  getMode() {
    return USE_SUPABASE ? "Supabase" : "localStorage";
  },

  // Clear all local data (useful for testing)
  clearLocalStorage() {
    localStorage.removeItem("garazh_customers");
    localStorage.removeItem("garazh_vehicles");
    localStorage.removeItem("garazh_orders");
    localStorage.removeItem("garazh_serviceTypes");
    console.log("✅ Local storage cleared");
  },
};

export default {
  customers: customersDB,
  vehicles: vehiclesDB,
  orders: ordersDB,
  utils: dbUtils,
};
