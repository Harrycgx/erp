import supabase from "../../lib/supabase";

export async function createProductionJob(
  job
) {

  const { data, error } =
    await supabase
      .from("production_jobs")
      .insert([job])
      .select()
      .single();

  if (error) {

    console.error(error);

    return null;
  }

  return data;
}

export async function fetchProductionJobs() {

  const { data, error } =
    await supabase
      .from("production_jobs")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  if (error) {

    console.error(error);

    return [];
  }

  return data;
}
export async function updateProductionJob(
  id,
  updates
) {

  const { data, error } =
    await supabase
      .from("production_jobs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

  if (error) {

    console.error(error);

    return null;
  }

  return data;
}