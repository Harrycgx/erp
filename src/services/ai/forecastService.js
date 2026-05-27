import supabase from "../../lib/supabase";

export async function generateForecast() {
  const { data: quotations } =
    await supabase
      .from("quotations")
      .select("*");

  const { data: inventory } =
    await supabase
      .from("inventory_ledger")
      .select("*");

  const quotationVolume =
    quotations?.length || 0;

  const revenue =
    quotations?.reduce(
      (sum, quote) =>
        sum +
        Number(
          quote.estimated_price || 0
        ),
      0
    ) || 0;

  const inventoryUsage =
    inventory?.reduce(
      (sum, entry) =>
        sum +
        Math.abs(
          Number(
            entry.quantity || 0
          )
        ),
      0
    ) || 0;

  const recommendations =
    [];

  if (
    quotationVolume > 20
  ) {
    recommendations.push(
      "High quotation demand detected. Increase production planning."
    );
  }

  if (
    inventoryUsage > 500
  ) {
    recommendations.push(
      "Inventory consumption is rising. Review procurement schedules."
    );
  }

  if (revenue > 100000) {
    recommendations.push(
      "Revenue growth trend detected. Consider scaling operations."
    );
  }

  return {
    quotationVolume,

    revenue,

    inventoryUsage,

    recommendations,
  };
}