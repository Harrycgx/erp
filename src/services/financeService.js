import supabase from "../lib/supabase";

export async function fetchInvoices() {
  const { data, error } =
    await supabase
      .from("invoices")
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

export async function createInvoice(
  invoice
) {
  const { data, error } =
    await supabase
      .from("invoices")
      .insert([invoice])
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

export async function updateInvoice(
  id,
  updates
) {
  const { data, error } =
    await supabase
      .from("invoices")
      .update(updates)
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

export async function markInvoicePaid(
  invoice
) {
  return updateInvoice(
    invoice.id,
    {
      paid_amount:
        invoice.invoice_amount,

      due_amount: 0,

      payment_status:
        "paid",
    }
  );
}