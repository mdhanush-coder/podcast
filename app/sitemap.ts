import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/pricing", "/contact", "/privacy", "/terms"].map((p) => ({ url: `${SITE.url}${p}` }));
}
