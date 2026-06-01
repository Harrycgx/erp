import supabase from "../lib/supabase";

export async function fetchAuditLogs() {
  const { data, error } =
    await supabase
      .from("audit_logs")
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