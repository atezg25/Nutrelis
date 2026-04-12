import { MetadataRoute } from "next";

const URL = "https://nutrelis-v76z.vercel.app";

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
