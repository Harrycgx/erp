import supabase from "../../lib/supabase";

export async function fetchAnalytics() {
  try {

    const {
      data: quotations,
      error: quotationsError,
    } = await supabase
      .from("quotations")
      .select("*");

    if (quotationsError) {
      console.error(
        "Quotations Error:",
        quotationsError
      );
    }

    const {
      data: production,
      error: productionError,
    } = await supabase
      .from("production_jobs")
      .select("*");

    if (productionError) {
      console.error(
        "Production Error:",
        productionError
      );
    }

    const {
      data: inventory,
      error: inventoryError,
    } = await supabase
      .from("inventory_ledger")
      .select("*");

    if (inventoryError) {
      console.error(
        "Inventory Error:",
        inventoryError
      );
    }

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
      inventory
        ?.filter(
          (entry) =>
            Number(
              entry.quantity
            ) < 0
        )
        .reduce(
          (sum, entry) =>
            sum +
            Math.abs(
              Number(
                entry.quantity
              )
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

  } catch (error) {

    console.error(
      "Analytics Failure:",
      error
    );

    return {
      totalRevenue: 0,
      quotationCount: 0,
      completedProduction: 0,
      inventoryConsumption: 0,
    };
  }
}