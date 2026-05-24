export async function fetchApi(endpoint, options = {}) {
  const baseUrl = import.meta.env.VITE_API_URL ?? '';
  const response = await fetch(`${baseUrl}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}
