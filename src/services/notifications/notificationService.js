import supabase from "../../lib/supabase";

export async function createNotification({
  userId,
  title,
  message,
  type = "general",
}) {
  const { error } =
    await supabase
      .from("notifications")
      .insert([
        {
          user_id: userId,

          title,

          message,

          type,
        },
      ]);

  if (error) {
    console.error(error);
  }
}

export async function fetchNotifications(
  userId
) {
  const { data, error } =
    await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    console.error(error);

    return [];
  }

  return data;
}