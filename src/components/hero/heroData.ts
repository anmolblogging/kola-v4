import { useEffect, useState } from "react";

/* Shared content for the hero design options. Screenshots live in /public/hero.
   Project facts come from each project's WordPress entry; quotes come from the
   testimonials already published on the homepage. */

export type Project = {
  slug: string;
  name: string;
  type: string;
  domain: string;
  img: string;
  mobile?: string;
  tagline: string;
  stats: { value: string; label: string }[];
};

export const PROJECTS: Project[] = [
  {
    slug: "livyor",
    name: "Livyor",
    type: "Shopify store",
    domain: "livyor.com",
    img: "/hero/livyor.webp",
    mobile: "/hero/livyor-m.webp",
    tagline: "A health-food brand brought to Shopify, from brief to build.",
    stats: [
      { value: "5", label: "Target keyphrases" },
      { value: "2", label: "Schema types" },
      { value: "3", label: "AEO FAQs live" },
    ],
  },
  {
    slug: "tazaari",
    name: "Tazaari",
    type: "Fashion e-commerce",
    domain: "tazaari.com",
    img: "/hero/tazaari.webp",
    mobile: "/hero/tazaari-m.webp",
    tagline: "Fashion e-commerce built to convert, plus SEO that doubled organic traffic.",
    stats: [
      { value: "2x", label: "Organic traffic in 3 months" },
      { value: "6", label: "Target keyphrases" },
      { value: "3", label: "AEO FAQs live" },
    ],
  },
  {
    slug: "carpet-cuts",
    name: "Carpet Cuts",
    type: "E-commerce, Australia",
    domain: "carpetcuts.au",
    img: "/hero/carpetcuts.webp",
    mobile: "/hero/carpetcuts-m.webp",
    tagline: "Heritage craft meets modern digital design for an Australian brand.",
    stats: [
      { value: "5", label: "Target keyphrases" },
      { value: "3", label: "Schema types" },
      { value: "3", label: "AEO FAQs live" },
    ],
  },
  {
    slug: "dhanuka-investments",
    name: "Dhanuka Investments",
    type: "Real estate platform",
    domain: "dhanukainvestments.com",
    img: "/hero/dhanuka.webp",
    mobile: "/hero/dhanuka-m.webp",
    tagline: "Trust built into every page of a Mumbai real estate platform.",
    stats: [
      { value: "4", label: "Target keyphrases" },
      { value: "2", label: "Schema types" },
      { value: "3", label: "AEO FAQs live" },
    ],
  },
  {
    slug: "revent-ai",
    name: "Revent AI",
    type: "SaaS website",
    domain: "revent.ai",
    img: "/hero/revent.webp",
    tagline: "The Revent AI platform website, engineered end to end.",
    stats: [
      { value: "5", label: "Target keyphrases" },
      { value: "2", label: "Schema types" },
      { value: "3", label: "AEO FAQs live" },
    ],
  },
];

export const QUOTES = [
  {
    quote: "Within three months of launch, our organic traffic doubled and conversions followed.",
    name: "Vinit Jain",
    title: "Founder, Tazaari",
  },
  {
    quote: "Our lead generation has improved significantly and the quality of enquiries we receive now is on a completely different level.",
    name: "Dhaval Sanghavi",
    title: "Director, Veena Developers",
  },
  {
    quote: "Our Google rankings improved within weeks and the leads started coming in consistently.",
    name: "James Whitfield",
    title: "CEO, BrightPath (UK)",
  },
];

export const LOGOS = [
  { src: "/logos/veena-developers.svg", alt: "Veena Developers" },
  { src: "/logos/vayu-valves.svg", alt: "Vayu Valves" },
  { src: "/logos/tazaari.svg", alt: "Tazaari" },
  { src: "/logos/roy-infra.svg", alt: "Roy Infra" },
  { src: "/logos/purva-desai.svg", alt: "Purva Desai Company" },
  { src: "/logos/premier-league-news-now.svg", alt: "Premier League News Now" },
];

/* Simple auto-advancing index, paused while `paused` is true */
export const useCycle = (length: number, ms: number, paused = false) => {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (paused || length < 2) return;
    const t = window.setInterval(() => setI((v) => (v + 1) % length), ms);
    return () => window.clearInterval(t);
  }, [length, ms, paused]);
  return [i, setI] as const;
};

/* Small browser chrome bar used by several options */
export const chromeDots = "keep-round w-2 h-2 bg-black/15";
