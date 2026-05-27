import supabase from "../lib/supabase";

export async function fetchAiPredictions() {
  const { data, error } = await supabase
    .from("ai_predictions")
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