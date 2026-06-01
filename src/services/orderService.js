import supabase from "../lib/supabase";

import {
  createProductionJob,
} from "./production/productionService";

export async function fetchOrders() {
  const { data, error } =
    await supabase
      .from("orders")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    console.error(error);

    return {
      data: [],
      error,
    };
  }

  return {
    data,
    error: null,
  };
}

export async function createOrder(
  payload
) {
  const { data, error } =
    await supabase
      .from("orders")
      .insert([payload])
      .select()
      .single();

  if (error) {
    console.error(error);

    return {
      data: null,
      error,
    };
  }

  try {
    await createProductionJob({
      order_id: data.id,

      order_number:
        data.order_number,

      quotation_number:
        data.quotation_number,

      customer_name:
        data.customer_name,

      quantity:
        data.quantity,

      stage: "planning",
    });
  } catch (err) {
    console.error(
      "AUTO PRODUCTION ERROR",
      err
    );
  }

  return {
    data,
    error: null,
  };
}

export async function updateOrder(
  id,
  payload
) {
  const { data, error } =
    await supabase
      .from("orders")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

  if (error) {
    console.error(error);

    return {
      data: null,
      error,
    };
  }

  return {
    data,
    error: null,
  };
}