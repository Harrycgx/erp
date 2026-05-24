export async function fetchClient(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Network error: ${response.status}`);
  }
  return response.json();
}
