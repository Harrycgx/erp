import supabase from "../lib/supabase";

export async function fetchInventoryItems() {
  const { data, error } = await supabase
    .from("inventory_items")
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