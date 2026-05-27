import supabase from "../../../lib/supabase";

export async function fetchQuotations() {
  const { data, error } =
    await supabase
      .from("quotations")
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

export async function createQuotation(
  quotation
) {
  const { data, error } =
    await supabase
      .from("quotations")
      .insert([quotation])
      .select()
      .single();

  if (error) {
    console.error(error);

    return null;
  }

  await supabase
    .from("production_jobs")
    .insert([
      {
        job_name:
          "Production for " +
          quotation.customer_name,

        quotation_number:
          quotation.quotation_number,

        customer_name:
          quotation.customer_name,

        quantity:
          quotation.quantity,

        box_style:
          quotation.box_style,

        status: "pending",
      },
    ]);

  return data;
}

export async function updateQuotation(
  id,
  updates
) {
  const { data, error } =
    await supabase
      .from("quotations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

  if (error) {
    console.error(error);

    return null;
  }

  return data;
}