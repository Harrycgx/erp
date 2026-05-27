import supabase from "../../lib/supabase";

export async function fetchAnalytics() {
  const { data: quotations } =
    await supabase
      .from("quotations")
      .select("*");

  const { data: production } =
    await supabase
      .from("production_jobs")
      .select("*");

  const { data: inventory } =
    await supabase
      .from("inventory_ledger")
      .select("*");

  const totalRevenue =
    quotations?.reduce(
      (sum, quote) =>
        sum +
        Number(
          quote.estimated_price || 0
        ),
      0
    ) || 0;

  const completedProduction =
    production?.filter(
      (job) =>
        job.stage ===
        "completed"
    ).length || 0;

  const inventoryConsumption =
    inventory?.filter(
      (entry) =>
        entry.quantity < 0
    ).reduce(
      (sum, entry) =>
        sum +
        Math.abs(
          entry.quantity
        ),
      0
    ) || 0;

  return {
    totalRevenue,

    quotationCount:
      quotations?.length || 0,

    completedProduction,

    inventoryConsumption,
  };
}