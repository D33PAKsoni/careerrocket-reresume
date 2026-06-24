import type { GreenResource } from "./schemas";

/**
 * The AI never returns a specific URL (see the system prompt in
 * generateGreenCareers.ts) because it has no way to verify one exists.
 * Instead it returns a search query, and this function turns that into
 * a real, guaranteed-to-load search results page — never a 404, never a
 * link to the wrong thing.
 */
export function buildResourceLink(resource: GreenResource): string {
  const encodedQuery = encodeURIComponent(resource.query);

  if (resource.type === "video") {
    return `https://www.youtube.com/results?search_query=${encodedQuery}`;
  }

  if (resource.type === "course") {
    return `https://www.google.com/search?q=${encodedQuery}+free+course`;
  }

  // "article" and any future type fall back to a general search
  return `https://www.google.com/search?q=${encodedQuery}`;
}
