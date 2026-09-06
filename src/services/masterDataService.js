import supabase from "../lib/supabase";

/**
 * Master Data Mapping Service
 * Manage mappings between internal IDs and external systems (Tally, Excel).
 */

export async function setMapping(params) {
  const { externalSystem, internalType, internalId, externalType, externalId, notes } = params;
  const payload = {
    external_system: externalSystem,
    internal_type: internalType,
    internal_id: internalId,
    external_type: externalType,
    external_id: externalId,
    notes: notes || null,
    // created_by and updated_at handled by defaults/triggers
  };
  const { data, error } = await supabase
    .from('integration_master_mappings')
    .upsert(payload, { onConflict: ['external_system', 'internal_type', 'internal_id', 'external_type'] })
    .single();
  if (error) throw error;
  return data;
}

export async function getExternalId(params) {
  const { externalSystem, internalType, internalId, externalType } = params;
  const { data, error } = await supabase
    .from('integration_master_mappings')
    .select('external_id')
    .match({
      external_system: externalSystem,
      internal_type: internalType,
      internal_id: internalId,
      external_type: externalType,
      active: true,
    })
    .single();
  if (error) throw error;
  return data?.external_id || null;
}

export async function getInternalId(params) {
  const { externalSystem, externalType, externalId } = params;
  const { data, error } = await supabase
    .from('integration_master_mappings')
    .select('internal_id')
    .match({
      external_system: externalSystem,
      external_type: externalType,
      external_id: externalId,
      active: true,
    })
    .single();
  if (error) throw error;
  return data?.internal_id || null;
}

export async function removeMapping(params) {
  const { externalSystem, internalType, internalId, externalType } = params;
  const { data, error } = await supabase
    .from('integration_master_mappings')
    .update({ active: false })
    .match({
      external_system: externalSystem,
      internal_type: internalType,
      internal_id: internalId,
      external_type: externalType,
    })
    .single();
  if (error) throw error;
  return data;
}
