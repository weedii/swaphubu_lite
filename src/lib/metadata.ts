import { Metadata } from "next";

interface PageMetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

const defaultMeta = {
  title: "SwapHubu",
  description:
    "Seamless fiat to crypto exchange platform - Buy and sell cryptocurrencies instantly",
  keywords: [
    "crypto",
    "exchange",
    "fiat",
    "bitcoin",
    "ethereum",
    "buy crypto",
    "sell crypto",
    "swaphubu",
  ],
  ogImage: "/swaphubu_logo-B9BPaYze.webp",
  siteUrl: "https://swaphubu.com",
};

export function generateMetadata({
  title,
  description,
  keywords,
  ogImage,
}: PageMetaProps = {}): Metadata {
  const metaTitle = title
    ? `${title} | ${defaultMeta.title}`
    : defaultMeta.title;
  const metaDescription = description || defaultMeta.description;
  const metaKeywords = keywords
    ? keywords.split(",").map((k) => k.trim())
    : defaultMeta.keywords;
  const metaOgImage = ogImage || defaultMeta.ogImage;

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://swaphubu.com"
    ),
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      images: [metaOgImage],
      type: "website",
      siteName: defaultMeta.title,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [metaOgImage],
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}
