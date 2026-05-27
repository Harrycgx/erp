import supabase from "../lib/supabase";

export async function fetchAnalyticsEvents() {
  const { data, error } = await supabase
    .from("analytics_events")
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