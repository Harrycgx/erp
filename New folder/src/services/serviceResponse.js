export function ok(data = null) {
  return { data, error: null };
}

export function fail(error, fallbackMessage = 'Operation failed.') {
  if (error instanceof Error) return { data: null, error };
  return { data: null, error: new Error(error?.message || fallbackMessage) };
}

export function getSupabaseErrorMessage(error, fallbackMessage = 'Supabase request failed.') {
  return error?.message || error?.details || fallbackMessage;
}
