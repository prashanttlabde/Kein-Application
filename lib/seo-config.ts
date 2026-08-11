export const defaultSEO = {
  titleTemplate: "%s | Kein",
  defaultTitle: "Kein - Watch. Shop. Earn.",
  description: "Watch live streams, shop products, and earn with your favorite creators on Kein - India's premier social commerce platform.",
  canonical: "https://kein.in",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://kein.in",
    site_name: "Kein",
    title: "Kein - Live Social Commerce Platform | Shop with Creators",
    description: "Discover, shop, and earn with creators through live streams and reels on India's leading social commerce platform.",
    images: [
      {
        url: "https://kein.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kein - Watch. Shop. Earn.",
      },
    ],
  },
  twitter: {
    handle: "@kein_official",
    site: "@kein_official",
    cardType: "summary_large_image",
  },
  additionalMetaTags: [
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
    {
      name: "theme-color",
      content: "#003366",
    },
    {
      name: "keywords",
      content: "live shopping, social commerce, creator marketing, live streaming, reels, shopping, earn money, creators, India",
    },
    {
      name: "author",
      content: "Kein",
    },
    {
      name: "robots",
      content: "index, follow",
    },
  ],
  additionalLinkTags: [
    {
      rel: "icon",
      href: "/favicon.ico",
    },
    {
      rel: "apple-touch-icon",
      href: "/apple-touch-icon.png",
      sizes: "180x180",
    },
    {
      rel: "manifest",
      href: "/manifest.json",
    },
  ],
};

// Page-specific SEO configurations
export const pageSEO = {
  home: {
    title: "Kein | Watch. Shop. Earn.",
    description: "Explore live shopping and creator reels on Kein. Discover products, watch live streams, and earn with your favorite creators in India.",
    canonical: "https://kein.in",
    keywords: "live shopping India, social commerce, creator economy, live streaming shopping, shop with creators",
  },
  explore: {
    title: "Explore Live Shopping & Reels",
    description: "Discover trending products, live streams, and creator reels on Kein. Shop directly from your favorite creators in India.",
    canonical: "https://kein.in/explore",
    keywords: "explore products, trending items, live shopping, creator reels, shopping videos",
  },
  reels: {
    title: "Shopping Reels & Videos",
    description: "Watch engaging shopping reels from top creators. Discover products through short-form video content on Kein.",
    canonical: "https://kein.in/reels",
    keywords: "shopping reels, product videos, short videos, creator content, video shopping",
  },
  live: {
    title: "Live Shopping Streams",
    description: "Join live shopping sessions with your favorite creators. Shop in real-time and get exclusive deals on Kein.",
    canonical: "https://kein.in/live",
    keywords: "live shopping, live streams, real-time shopping, live deals, interactive shopping",
  },
};

// Schema.org structured data templates
export const schemaTemplates = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Kein",
    url: "https://kein.in",
    logo: "https://kein.in/logo.png",
    description: "India's premier live social commerce platform connecting creators, sellers, and shoppers.",
    foundingDate: "2024",
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    sameAs: [
      "https://twitter.com/kein_official",
      "https://instagram.com/kein_official",
      "https://facebook.com/kein_official",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-XXXXXXXXXX",
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
  },
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kein",
    url: "https://kein.in",
    description: "Watch live streams, shop products, and earn with your favorite creators on Kein.",
    inLanguage: "en-IN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://kein.in/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  },
  webApplication: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Kein",
    url: "https://kein.in",
    applicationCategory: "ShoppingApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    description: "Live social commerce platform for shopping with creators",
  },
};
