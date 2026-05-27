export function calcPricing(specs, rates = {}) {
  const length = parseFloat(specs.length) || 0;
  const width = parseFloat(specs.width) || 0;
  const height = parseFloat(specs.height) || 0;
  const qty = parseInt(specs.qty, 10) || 0;

  const box_style =
    specs.box_style || "Regular Carton";

  const print_type =
    specs.print_type || "No Print";

  const is_rush = !!specs.is_rush;

  if (
    qty <= 0 ||
    length <= 0 ||
    width <= 0 ||
    height <= 0
  ) {
    return {
      base_unit: 0,
      after_rush: 0,
      die_mould: 0,
      plate_fee: 0,
      design_fee: 0,
      gst: 0,
      total: 0,
    };
  }

  const surfaceAreaSqIn =
    2 *
    (
      length * width +
      width * height +
      length * height
    );

  const baseRatePerSqIn =
    rates.base_sqin || 0.04;

  let unitCost =
    surfaceAreaSqIn * baseRatePerSqIn;

  if (box_style === "Mailer Box")
    unitCost *= 1.25;

  if (box_style === "Die-Cut")
    unitCost *= 1.15;

  if (box_style === "Luxury Rigid")
    unitCost *= 2.1;

  if (print_type === "1-Color Flexo")
    unitCost += 1.5;

  if (print_type === "2-Color Flexo")
    unitCost += 2.8;

  if (print_type === "Full CMYK Offset")
    unitCost += 5.5;

  let discount = 0;

  if (qty >= 1000)
    discount = 0.25;
  else if (qty >= 500)
    discount = 0.15;
  else if (qty >= 200)
    discount = 0.05;

  unitCost *= (1 - discount);

  const raw_production =
    unitCost * qty;

  const after_rush = is_rush
    ? raw_production * 1.2
    : raw_production;

  const dieMould =
    [
      "Mailer Box",
      "Die-Cut",
      "Custom",
    ].includes(box_style)
      ? rates.die_mould || 5500
      : 0;

  const numColors =
    print_type === "1-Color Flexo"
      ? 1
      : print_type === "2-Color Flexo"
      ? 2
      : print_type ===
        "Full CMYK Offset"
      ? 4
      : 0;

  const plate_fee =
    numColors *
    (rates.plate_per_color || 1800);

  const design_fee =
    specs.artwork_url?.trim()
      ? rates.design_artwork || 500
      : rates.design_noart || 1500;

  const total_taxable_base =
    after_rush +
    dieMould +
    plate_fee +
    design_fee;

  const gst_pct =
    (rates.gst_pct || 18) / 100;

  const gst =
    total_taxable_base * gst_pct;

  const total =
    total_taxable_base + gst;

  return {
    base_unit: +unitCost.toFixed(2),
    after_rush: +after_rush.toFixed(0),
    die_mould: dieMould,
    plate_fee,
    design_fee,
    gst: +gst.toFixed(0),
    total: +total.toFixed(0),
  };
}