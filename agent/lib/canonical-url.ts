import { createHash } from "crypto";

const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "ref",
  "ref_src",
  "ref_url",
  "fbclid",
  "gclid",
  "mc_cid",
  "mc_eid",
  "amp",
  "share",
  "share_id",
  "_hsenc",
  "_hsmi",
]);

export function canonicalize(url: string): string {
  try {
    const u = new URL(url.trim());
    u.hostname = u.hostname.toLowerCase().replace(/^www\./, "");
    u.protocol = "https:";
    u.hash = "";
    const newSearch = new URLSearchParams();
    for (const [k, v] of u.searchParams) {
      if (!TRACKING_PARAMS.has(k.toLowerCase())) newSearch.set(k, v);
    }
    u.search = newSearch.toString();
    let out = u.toString();
    if (out.endsWith("/") && u.pathname !== "/") out = out.slice(0, -1);
    return out;
  } catch {
    return url.trim();
  }
}

export function urlHash(url: string): string {
  return createHash("sha1").update(canonicalize(url)).digest("hex").slice(0, 16);
}
