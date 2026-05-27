import supabase from "../../lib/supabase";

export async function addInventoryMovement(
  movement
) {
  const { data, error } =
    await supabase
      .from("inventory_ledger")
      .insert([movement])
      .select()
      .single();

  if (error) {
    console.error(error);

    return null;
  }

  return data;
}

export async function fetchInventoryLedger() {
  const { data, error } =
    await supabase
      .from("inventory_ledger")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    console.error(error);

    return [];
  }

  return data;
}