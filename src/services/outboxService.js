import supabase from "../lib/supabase";

/**
 * Integration Outbox Service
 * Wrapper around Supabase RPC functions for Tally integration outbox.
 */

export async function enqueueTallyEvent(eventId) {
  const { data, error } = await supabase.rpc('enqueue_tally_accounting_event', { p_event_id: eventId });
  if (error) throw error;
  return data; // returns { outbox_id, external_reference, duplicate }
}

export async function claimTallyItem() {
  const { data, error } = await supabase.rpc('claim_tally_outbox_item');
  if (error) throw error;
  return data; // returns array of rows (outbox_id, event_id, event_type, external_reference, payload, attempts)
}

export async function completeTallyItem(outboxId, success, externalReference = null, errorText = null, requiresReview = false) {
  const { data, error } = await supabase.rpc('complete_tally_outbox_item', {
    p_outbox_id: outboxId,
    p_success: success,
    p_external_reference: externalReference,
    p_error: errorText,
    p_requires_review: requiresReview,
  });
  if (error) throw error;
  return data; // returns { status, processed_at }
}