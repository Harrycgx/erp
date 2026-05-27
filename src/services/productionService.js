import supabase from "../lib/supabase";

export async function fetchProductionJobs() {
  const { data, error } = await supabase
    .from("production_jobs")
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