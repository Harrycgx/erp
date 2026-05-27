import supabase from "../../lib/supabase";

export async function uploadQuotationImport(
  rows,
  batchId
) {
  const formatted =
    rows.map((row) => ({
      customer_name:
        row.customer_name,

      quantity:
        Number(row.quantity),

      box_style:
        row.box_style,

      print_type:
        row.print_type,

      estimated_price:
        Number(
          row.estimated_price
        ),

      import_batch:
        batchId,
    }));

  const { data, error } =
    await supabase
      .from(
        "import_staging_quotations"
      )
      .insert(formatted);

  if (error) {
    console.error(error);

    return null;
  }

  return data;
}