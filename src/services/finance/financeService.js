import supabase from "../../lib/supabase";

export async function createLedgerEntry(
  entry
) {
  const { data, error } =
    await supabase
      .from("financial_ledger")
      .insert([entry])
      .select()
      .single();

  if (error) {
    console.error(error);

    return null;
  }

  return data;
}

export async function fetchLedgerEntries() {
  const { data, error } =
    await supabase
      .from("financial_ledger")
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