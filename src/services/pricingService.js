import supabase from "../lib/supabase";

// ─── Constants & Configuration ──────────────────────────────────
const PLY_LAYERS = { "2 Ply": 2, "3 Ply": 3, "5 Ply": 5, "7 Ply": 7 };
const FLUTE_TAKEUP = { 
    "A Flute": 1.52, "B Flute": 1.32, "C Flute": 1.45, 
    "E Flute": 1.26, "F Flute": 1.22, "BC Flute": 1.38, "EB Flute": 1.30 
};
const LABOUR_COST_PER_PLY = { "2 Ply": 0.8, "3 Ply": 1.2, "5 Ply": 2.0, "7 Ply": 2.8 };
const PRINTING_COST_PER_COLOR_PER_SQM = { 
    "None": 0, "Flexo Printing": 1.8, "Offset Printing": 3.2, 
    "Digital Printing": 5.5, "Screen Printing": 2.4 
};
const BOX_SURCHARGE = { 
    "Regular Slotted Container (RSC)": 0, "Half Slotted Container (HSC)": 0.5, 
    "Full Overlap Container (FOL)": 0.8, "Die Cut Box": 2.5, "Tray": 1.8, 
    "Telescope Box": 1.5, "Custom": 3.0 
};

// ─── Internal Helper Functions ──────────────────────────────────
/** Validates and rounds numeric values to prevent floating point errors */
const round = (val, dec = 2) => Math.round(val * Math.pow(10, dec)) / Math.pow(10, dec);

/** Logs pricing service actions for diagnostic purposes */
const logAction = (action, payload) => {
    console.debug(`[PricingService] Executing: ${action}`, payload);
};

// ─── Data Fetching Logic ──────────────────────────────────────────
/** Fetches active pricing global rates, material rates, and margin rules */
export async function fetchActiveRates(forDate = null) {
    const date = forDate || new Date().toISOString().split("T")[0];
    try {
        const [globalsRes, materialRes, marginRes] = await Promise.all([
            supabase.from("pricing_globals").select("*").lte("effective_from", date).or(`effective_to.is.null,effective_to.gte.${date}`).order("effective_from", { ascending: false }).limit(1).single(),
            supabase.from("pricing_material_rates").select("*").lte("effective_from", date).or(`effective_to.is.null,effective_to.gte.${date}`).order("effective_from", { ascending: false }),
            supabase.from("pricing_margin_rules").select("*").lte("effective_from", date).or(`effective_to.is.null,effective_to.gte.${date}`).order("effective_from", { ascending: false }),
        ]);
        if (globalsRes.error) throw new Error(`Pricing globals: ${globalsRes.error.message}`);
        if (materialRes.error) throw new Error(`Material rates: ${materialRes.error.message}`);
        if (marginRes.error)   throw new Error(`Margin rules: ${marginRes.error.message}`);

        return { 
            globals: globalsRes.data, 
            materialRates: materialRes.data || [], 
            marginRules: marginRes.data || [], 
            ratesDate: date 
        };
    } catch (err) {
        console.error("Pricing Fetch Error:", err);
        throw err;
    }
}

// ─── Administrative Write Operations ────────────────────────────────
export async function createCustomerContract(payload, userId = null) {
    logAction("createCustomerContract", payload);
    const { data, error } = await supabase.from("pricing_customer_contracts").insert([{ ...payload, is_active: true, created_by: userId }]).select().single();
    if (error) throw new Error(`Contract Failure: ${error.message}`);
    return data;
}

export async function updateGlobalRates(payload, userId = null) {
    logAction("updateGlobalRates", payload);
    const today = new Date().toISOString().split("T")[0];

    // Supersede current active row
    const { data: current } = await supabase
        .from("pricing_globals")
        .select("*")
        .is("effective_to", null)
        .order("effective_from", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (current) {
        await supabase.from("pricing_globals").update({ effective_to: today }).eq("id", current.id);
        await supabase.from("pricing_audit_log").insert([{
            table_name: "pricing_globals", record_id: current.id,
            action: "superseded", old_values: current, new_values: payload,
            changed_by: userId, reason: payload.notes || "Rate update",
        }]);
    }

    const { data, error } = await supabase
        .from("pricing_globals")
        .insert([{
            effective_from:       payload.effective_from || today,
            effective_to:         null,
            inflation_adjustment: payload.inflation_adjustment ?? 0,
            material_adjustment:  payload.material_adjustment  ?? 0,
            default_margin:       payload.default_margin        ?? 15,
            default_gst:          payload.default_gst           ?? 18,
            waste_factor:         payload.waste_factor          ?? 1.08,
            notes:                payload.notes || null,
            created_by:           userId,
        }])
        .select()
        .single();

    if (error) throw new Error(`Global Update Failure: ${error.message}`);
    return data;
}

export async function updateMaterialRate(payload, userId = null) {
    logAction("updateMaterialRate", payload);
    const today = new Date().toISOString().split("T")[0];

    // Supersede matching active rows
    const { data: existing } = await supabase
        .from("pricing_material_rates")
        .select("*")
        .eq("paper_type", payload.paper_type)
        .eq("gsm_min", payload.gsm_min)
        .eq("gsm_max", payload.gsm_max)
        .is("effective_to", null);

    for (const row of existing || []) {
        await supabase.from("pricing_material_rates").update({ effective_to: today }).eq("id", row.id);
        await supabase.from("pricing_audit_log").insert([{
            table_name: "pricing_material_rates", record_id: row.id,
            action: "superseded", old_values: row, new_values: payload,
            changed_by: userId, reason: payload.notes || "Material rate update",
        }]);
    }

    const { data, error } = await supabase
        .from("pricing_material_rates")
        .insert([{
            effective_from: payload.effective_from || today,
            effective_to:   null,
            paper_type:     payload.paper_type,
            gsm_min:        Number(payload.gsm_min),
            gsm_max:        Number(payload.gsm_max),
            cost_per_kg:    Number(payload.cost_per_kg),
            notes:          payload.notes || null,
            created_by:     userId,
        }])
        .select()
        .single();

    if (error) throw new Error(`Material Update Failure: ${error.message}`);
    return data;
}

export async function createMarginRule(payload, userId = null) {
    logAction("createMarginRule", payload);
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
        .from("pricing_margin_rules")
        .insert([{
            effective_from: payload.effective_from || today,
            effective_to:   null,
            rule_type:      payload.rule_type,
            ply_type:       payload.ply_type    || null,
            box_type:       payload.box_type    || null,
            customer_id:    payload.customer_id || null,
            margin_percent: Number(payload.margin_percent),
            notes:          payload.notes || null,
            created_by:     userId,
        }])
        .select()
        .single();

    if (error) throw new Error(`Margin Rule Failure: ${error.message}`);

    await supabase.from("pricing_audit_log").insert([{
        table_name: "pricing_margin_rules", record_id: data.id,
        action: "created", old_values: null, new_values: data,
        changed_by: userId, reason: payload.notes || "Margin rule created",
    }]);

    return data;
}

// ─── Audit Log Logic (Simplified to prevent Schema Errors) ────────
export async function fetchPricingAuditLog() {
    const { data, error } = await supabase
        .from("pricing_audit_log")
        .select("*")
        .order("changed_at", { ascending: false }); // Using the verified column name
        
    if (error) {
        console.error("Audit log error detail:", error);
        throw new Error(`Audit fetch failed: ${error.message}`);
    }
    return data || [];
}

// ─── Formatting Helpers ──────────────────────────────────────────
export function formatINR(amount) {
    if (amount == null || isNaN(amount)) return "—";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}