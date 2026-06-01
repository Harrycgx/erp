import supabase from "../../lib/supabase";

export async function generateForecast() {
  const [
    quotationsResult,
    ordersResult,
    invoicesResult,
    inventoryResult,
    productionResult,
  ] = await Promise.all([
    supabase
      .from("quotations")
      .select("*"),

    supabase
      .from("orders")
      .select("*"),

    supabase
      .from("invoices")
      .select("*"),

    supabase
      .from("inventory_ledger")
      .select("*"),

    supabase
      .from("production_jobs")
      .select("*"),
  ]);

  const quotations =
    quotationsResult.data || [];

  const orders =
    ordersResult.data || [];

  const invoices =
    invoicesResult.data || [];

  const inventory =
    inventoryResult.data || [];

  const production =
    productionResult.data || [];

  const quotationVolume =
    quotations.length;

  const revenue =
    invoices.reduce(
      (sum, invoice) =>
        sum +
        Number(
          invoice.invoice_amount || 0
        ),
      0
    );

  const inventoryUsage =
    inventory.reduce(
      (sum, entry) =>
        sum +
        Math.abs(
          Number(
            entry.quantity || 0
          )
        ),
      0
    );

  const activeOrders =
    orders.filter(
      (order) =>
        order.production_status !==
        "completed"
    ).length;

  const completedProduction =
    production.filter(
      (job) =>
        job.stage ===
        "completed"
    ).length;

  const recommendations =
    [];

  if (
    quotationVolume > 20
  ) {
    recommendations.push(
      "Quotation demand is increasing. Prepare additional production capacity."
    );
  }

  if (
    activeOrders > 10
  ) {
    recommendations.push(
      "Production workload is rising. Review scheduling efficiency."
    );
  }

  if (
    inventoryUsage > 500
  ) {
    recommendations.push(
      "Inventory consumption is high. Review procurement planning."
    );
  }

  if (
    revenue > 100000
  ) {
    recommendations.push(
      "Revenue growth detected. Consider expanding production resources."
    );
  }

  if (
    completedProduction <
    activeOrders
  ) {
    recommendations.push(
      "Production backlog detected. Monitor dispatch and manufacturing timelines."
    );
  }

  if (
    recommendations.length === 0
  ) {
    recommendations.push(
      "Operations appear stable. Continue monitoring KPIs."
    );
  }

  return {
    quotationVolume,
    revenue,
    inventoryUsage,
    activeOrders,
    completedProduction,
    recommendations,
  };
}