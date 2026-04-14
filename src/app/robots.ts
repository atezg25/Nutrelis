import { MetadataRoute } from "next";

const URL = process.env.NEXT_PUBLIC_URL || "https://nutrelis.bio";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/checkout/", "/api/"],
    },
    sitemap: `${URL}/sitemap.xml`,
  };
}
