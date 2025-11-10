import { useFetch } from "@raycast/utils";
import { getCatFactsUrl, mapCatFactsResponse } from "../utils/api";

export function useCatFacts(count: number, lang?: string) {
  const url = getCatFactsUrl(count, lang);
  return useFetch(url, {
    mapResult: (data: { data?: string[] } | undefined) => ({ data: mapCatFactsResponse(data ?? { data: [] }) }),
    keepPreviousData: true,
    initialData: [],
  });
}
