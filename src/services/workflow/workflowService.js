import supabase from "../../lib/supabase";

export async function canTransition({
  entityType,
  fromState,
  toState,
  permissions,
}) {
  const { data, error } =
    await supabase
      .from(
        "workflow_transitions"
      )
      .select("*")
      .eq(
        "entity_type",
        entityType
      )
      .eq(
        "from_state",
        fromState
      )
      .eq("to_state", toState)
      .single();

  if (error || !data) {
    return false;
  }

  if (
    !data.required_permission
  ) {
    return true;
  }

  return permissions.includes(
    data.required_permission
  );
}