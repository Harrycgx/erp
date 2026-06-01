import supabase from "../../../lib/supabase";

export async function createInventoryItem(item) {
  const { data, error } =
    await supabase
      .from("inventory_items")
      .insert([item])
      .select()
      .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

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

export async function getInventoryBalance(
  materialName
) {
  const { data, error } =
    await supabase
      .from("inventory_ledger")
      .select("quantity")
      .eq(
        "material_name",
        materialName
      );

  if (error) {
    console.error(error);
    return 0;
  }

  return (
    data?.reduce(
      (sum, row) =>
        sum +
        Number(row.quantity || 0),
      0
    ) || 0
  );
}

export async function fetchInventoryHistory(
  materialName
) {
  const { data, error } =
    await supabase
      .from("inventory_ledger")
      .select("*")
      .eq(
        "material_name",
        materialName
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}