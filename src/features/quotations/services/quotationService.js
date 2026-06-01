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

  if (
    updates.status ===
    "approved"
  ) {
    try {
      await supabase
        .from("orders")
        .insert([
          {
            customer_name:
              data.customer_name,

            quotation_number:
              data.quotation_number,

            order_number:
              "ORD-" +
              Date.now(),

            box_type:
              data.box_style,

            quantity:
              data.quantity,

            total_amount:
              data.estimated_price,

            production_status:
              "planning",

            dispatch_status:
              "pending",

            payment_status:
              "pending",

            status:
              "active",
          },
        ]);
    } catch (err) {
      console.error(
        "ORDER AUTO CREATE FAILED",
        err
      );
    }
  }

  return data;
}