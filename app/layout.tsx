import type { Metadata, Viewport } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/content";
import { InkCursor } from "@/components/InkCursor";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mrcobbinah.vercel.app";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F1E9" },
    { media: "(prefers-color-scheme: dark)", color: "#211A16" },
  ],
  colorScheme: "light dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: site.title,
    template: `%s · ${site.shortName}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: siteUrl }],
  creator: site.name,
  publisher: site.name,
  keywords: [
    "Emmanuel Cobbinah",
    "MrCob.binah",
    "full-stack developer",
    "cloud engineer",
    "Accra",
    "Ghana",
    "AWS Cloud Practitioner",
    "COMPSSA",
    "University of Ghana",
    "ShopAurora",
    "Aurora Software Labs",
    "Pocket-F1",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: siteUrl,
    siteName: site.name,
    title: site.title,
    description: site.description,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${site.name} — ${site.heroLine}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  category: "technology",
};

// Runs in <head> before first paint:
// 1. theme: stored choice (THEME_KEY in lib/theme.ts), else the OS preference,
//    set as html[data-theme] and mirrored into the theme-color meta;
// 2. loader: hides the intro loader if it already played this session
//    (LOADER_SEEN_KEY in SignatureLoader.tsx).
const prePaintScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem("mrcob-theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";d.setAttribute("data-theme",t);var c=t==="dark"?"#211A16":"#F5F1E9";document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){m.setAttribute("content",c)})}catch(e){d.setAttribute("data-theme","light")}try{if(sessionStorage.getItem("mrcob-loader-seen")==="1")d.classList.add("loader-seen")}catch(e){}})()`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  alternateName: site.shortName,
  url: siteUrl,
  image: `${siteUrl}/emmanuel-hero.jpg`,
  jobTitle: "Software Engineer",
  description: site.description,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Accra",
    addressCountry: "GH",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "University of Ghana",
  },
  memberOf: {
    "@type": "Organization",
    name: "COMPSSA, University of Ghana Computer Science Students Association",
    description: "Vice President, 2026/2027 academic year",
  },
  sameAs: [
    "https://linkedin.com/in/emmanuelcobbinah",
    "https://github.com/emmanuelcobbinah007",
    "https://medium.com/@ecobbinahbuz",
  ],
  knowsAbout: [
    "Full-stack web development",
    "Cloud engineering",
    "AWS",
    "TypeScript",
    "Next.js",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${instrumentSerif.variable} ${dmSans.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: prePaintScript }} />
      </head>
      <body className="min-h-full bg-parchment text-ink font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <InkCursor />
      </body>
    </html>
  );
}
