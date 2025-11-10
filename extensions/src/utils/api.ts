const API_URL = "https://meowfacts.herokuapp.com/";

export function getCatFactsUrl(count: number, lang?: string) {
  let url = `${API_URL}?count=${count}`;
  if (lang) url += `&lang=${lang}`;
  return url;
}

export function mapCatFactsResponse(json: { data?: string[] }) {
  // Adjust if API response shape changes
  return Array.isArray(json.data) ? json.data : [];
}
