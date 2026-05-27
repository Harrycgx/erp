import supabase from "../../lib/supabase";

export async function logAudit({
  userId,
  action,
  entityType,
  entityId,
  metadata = {},
}) {
  const { error } =
    await supabase
      .from("audit_logs")
      .insert([
        {
          user_id: userId,

          action,

          entity_type:
            entityType,

          entity_id: entityId,

          metadata,
        },
      ]);

  if (error) {
    console.error(
      "Audit log failed:",
      error
    );
  }
}