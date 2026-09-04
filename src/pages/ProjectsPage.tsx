import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback, memo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "framer-motion";
import { ArrowLeft, ArrowUpRight, ExternalLink, Plus } from "lucide-react";

import ColumnGuides from "@/components/ColumnGuides";
import CustomCursor from "@/components/CustomCursor";
import CTAFooter from "@/components/CTAFooter";
import SectionDivider from "@/components/SectionDivider";
import AnimatedHeading from "@/components/AnimatedHeading";
import Loading from "@/components/Projectpageloader";
import ContactForm from "@/components/ContactForm";
import { setCachedSlugType } from "./SlugResolver";

/* ══════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════ */

const WP_API_BASE = "https://cms.kolacommunications.com/wp-json/wp/v2";

/* ══════════════════════════════════════════
   TYPES
══════════════════════════════════════════ */

interface AioseoSchema {
  "@context"?: string;
  "@graph"?: Array<{
    "@type": string;
    articleSection?: string;
    image?: { "@type": string; url: string; width: number; height: number };
    [key: string]: unknown;
  }>;
  articleSection?: string;
  [key: string]: unknown;
}

interface AioseoHeadJson {
  title?: string;
  description?: string;
  canonical_url?: string;
  robots?: string;
  keywords?: string;
  schema?: AioseoSchema;
  [key: string]: unknown;
}

interface WPProject {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string; protected: boolean };
  featured_media: number;
  date: string;
  aioseo_head_json?: AioseoHeadJson;
  acf?: {
    client_requirement_solution?: string;
    project_link?: string;
    live_url?: string;
    liveUrl?: string;
    hover_img?: string;
    tags?: string[];
    images?: string[];
    [key: string]: any;
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string; alt_text?: string }>;
    "wp:term"?: Array<Array<{ id: number; name: string; slug: string; taxonomy: string }>>;
  };
}

interface NormalizedProject {
  id: number;
  slug: string;
  title: string;
  img: string;
  formattedDate: string;
  category?: string;
  tags: string[];
}

interface ContentSection {
  heading: string;
  bodyHtml: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface NormalizedBlog {
  id: number;
  slug: string;
  title: string;
  img: string;
  formattedDate: string;
  categories: string[];
}

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */

const stripHtml = (html: string) =>
  html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/**
 * Decode HTML entities — handles &amp; → &, &#038; → &, &#8220; → ", etc.
 */
const decodeHtmlEntities = (str: string): string => {
  if (typeof document === "undefined") return str;
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
};

const getArticleSection = (seo?: AioseoHeadJson): string => {
  if (!seo?.schema) return "";
  const s = seo.schema;
  if (Array.isArray(s["@graph"])) {
    const article = s["@graph"].find(
      (n) => n["@type"] === "Article" || n["@type"] === "NewsArticle" || n["@type"] === "WebPage"
    );
    if (article?.articleSection) return article.articleSection as string;
  }
  if (typeof s.articleSection === "string") return s.articleSection;
  return "";
};

const getSchemaImageUrl = (seo?: AioseoHeadJson): string => {
  if (!seo?.schema) return "";
  const s = seo.schema;
  if (Array.isArray(s["@graph"])) {
    const article = s["@graph"].find(
      (n) => n["@type"] === "Article" || n["@type"] === "NewsArticle" || n["@type"] === "WebPage"
    );
    if (
      article?.image &&
      typeof (article.image as { url?: string }).url === "string"
    )
      return (article.image as { url: string }).url;
  }
  return "";
};

const normalizeOther = (p: WPProject): NormalizedProject => {
  if (p.slug) {
    setCachedSlugType(p.slug, "project");
  }
  const img =
    p._embedded?.["wp:featuredmedia"]?.[0]?.source_url ??
    getSchemaImageUrl(p.aioseo_head_json) ??
    "/placeholder.jpg";
  const rawSection = getArticleSection(p.aioseo_head_json);
  const termTags = (p as any)._embedded?.["wp:term"]?.flat()?.map((t: any) => decodeHtmlEntities(t.name)) ?? [];
  const acfTags = p.acf?.tags?.map(decodeHtmlEntities) ?? [];
  const sectionTags = rawSection ? rawSection.split(",").map((t: string) => decodeHtmlEntities(t.trim())).filter(Boolean) : [];
  const tags: string[] = Array.from(new Set([...sectionTags, ...termTags, ...acfTags])).filter(Boolean).slice(0, 3);
  const allTerms = (p as any)._embedded?.["wp:term"]?.flat() || [];
  const termCategories = allTerms.filter((t: any) => t?.taxonomy === "project-category" && t?.name).map((t: any) => decodeHtmlEntities(t.name));
  const category = termCategories.length > 0 ? termCategories[0] : (sectionTags.length > 0 ? sectionTags[0] : undefined);

  return {
    id: p.id,
    slug: p.slug,
    title: decodeHtmlEntities(p.title.rendered),
    img,
    formattedDate: formatDate(p.date),
    category,
    tags,
  };
};

const formatDate = (iso: string): string => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

const normalizeBlog = (p: any): NormalizedBlog => {
  if (p.slug) {
    setCachedSlugType(p.slug, "blog");
  }
  const img =
    p._embedded?.["wp:featuredmedia"]?.[0]?.source_url ??
    getSchemaImageUrl(p.aioseo_head_json) ??
    "/placeholder.jpg";
  const catTerms = p._embedded?.["wp:term"]?.[0]?.map((t: any) => decodeHtmlEntities(t.name)) ?? [];
  const tagTerms = p._embedded?.["wp:term"]?.[1]?.map((t: any) => decodeHtmlEntities(t.name)) ?? [];
  const rawSection = getArticleSection(p.aioseo_head_json);
  const sectionTags = rawSection ? rawSection.split(",").map((t: string) => decodeHtmlEntities(t.trim())).filter(Boolean) : [];
  const allTags = Array.from(new Set([...catTerms, ...sectionTags, ...tagTerms])).filter(Boolean).slice(0, 3);

  return {
    id: p.id,
    slug: p.slug,
    title: decodeHtmlEntities(p.title?.rendered ?? ""),
    img,
    formattedDate: formatDate(p.date),
    categories: allTags,
  };
};

const extractContentLiveUrl = (html: string): string => {
  const match = /<a\s+[^>]*href="([^"]+)"[^>]*>[^<]*live[^<]*<\/a>/i.exec(html);
  return match ? match[1].trim() : "";
};

const removeContentLiveParagraph = (html: string): string =>
  html
    .replace(/<p[^>]*>\s*<a\s+[^>]*href="[^"]+"[^>]*>[^<]*live[^<]*<\/a>\s*<\/p>/gi, "")
    .replace(/<a\s+[^>]*href="[^"]+"[^>]*>[^<]*live[^<]*<\/a>/gi, "");

const formatBodyHtml = (html: string): string => {
  let formatted = html;
  if (!/<(p|div|ul|ol|table|blockquote|details)/i.test(formatted)) {
    formatted = formatted
      .split(/\r?\n\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${p.replace(/\r?\n/g, "<br />")}</p>`)
      .join("");
  }
  return formatted.replace(/<a\s+([^>]*href="[^"]+"[^>]*)>/gi, (match, attrs) => {
    let newAttrs = attrs;
    if (!/target=/i.test(newAttrs)) {
      newAttrs += ' target="_blank" rel="noopener noreferrer"';
    }
    return `<a ${newAttrs}>`;
  });
};

const parseContentSections = (html: string): ContentSection[] => {
  const normalised = html.replace(/>\s+</g, "><").trim();
  const parts = normalised.split(/(?=<h3[\s>])/gi);
  const sections: ContentSection[] = [];

  for (const part of parts) {
    const h3Match = part.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    if (!h3Match) {
      const stripped = part.replace(/<[^>]+>/g, "").trim();
      if (stripped) sections.push({ heading: "", bodyHtml: part.trim() });
      continue;
    }
    const heading = decodeHtmlEntities(
      h3Match[1].replace(/<[^>]+>/g, "").trim()
    );
    const bodyHtml = part
      .slice(part.indexOf(h3Match[0]) + h3Match[0].length)
      .trim();
    if (heading || bodyHtml) sections.push({ heading, bodyHtml });
  }

  return sections;
};

const parseFaqItems = (html: string): FaqItem[] => {
  const items: FaqItem[] = [];
  const detailRegex = /<details[^>]*>([\s\S]*?)<\/details>/gi;
  let match: RegExpExecArray | null;

  while ((match = detailRegex.exec(html)) !== null) {
    const inner = match[1];
    const summaryMatch = inner.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i);
    if (!summaryMatch) continue;
    const question = decodeHtmlEntities(
      summaryMatch[1].replace(/<[^>]+>/g, "").trim()
    );
    const rawAnswer = inner
      .replace(/<summary[^>]*>[\s\S]*?<\/summary>/i, "")
      .trim();
    const answer = formatBodyHtml(decodeHtmlEntities(rawAnswer));
    if (question) items.push({ question, answer });
  }

  if (!items.length) {
    const pRegex = /<p[^>]*><strong[^>]*>(.*?)<\/strong>([\s\S]*?)<\/p>/gi;
    while ((match = pRegex.exec(html)) !== null) {
      const question = decodeHtmlEntities(
        match[1].replace(/<[^>]+>/g, "").trim()
      );
      const answer = formatBodyHtml(decodeHtmlEntities(match[2].trim()));
      if (question) items.push({ question, answer });
    }
  }

  return items;
};

/* ══════════════════════════════════════════
   SEO HOOK
══════════════════════════════════════════ */

const upsertMeta = (sel: string, attrKey: string, attrVal: string, content: string) => {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(sel);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrKey, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const upsertCanonical = (href: string) => {
  if (!href) return;
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
};

const upsertJsonLd = (data: object) => {
  const ID = "kola-project-jsonld";
  let el = document.getElementById(ID) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = ID;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
};

const useProjectSEO = (project: WPProject | null, img: string, plainDesc: string) => {
  useEffect(() => {
    if (!project) return;
    const seo = project.aioseo_head_json;
    const metaTitle = seo?.title ?? decodeHtmlEntities(project.title.rendered);
    const metaDesc = seo?.description ?? plainDesc;
    const canonical =
      seo?.canonical_url && !seo.canonical_url.includes("cms.kolacommunications.com")
        ? seo.canonical_url
        : `https://kolacommunications.com/${project.slug}`;
    const ogImage = getSchemaImageUrl(seo) || img;
    const prevTitle = document.title;
    document.title = metaTitle;

    upsertMeta('meta[name="description"]', "name", "description", metaDesc);
    upsertMeta('meta[name="keywords"]', "name", "keywords", seo?.keywords ?? "");
    upsertMeta('meta[name="robots"]', "name", "robots", seo?.robots ?? "");
    upsertCanonical(canonical);
    upsertMeta('meta[property="og:type"]', "property", "og:type", "article");
    upsertMeta('meta[property="og:title"]', "property", "og:title", metaTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", metaDesc);
    upsertMeta('meta[property="og:image"]', "property", "og:image", ogImage);
    upsertMeta('meta[property="og:url"]', "property", "og:url", canonical);
    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", metaTitle);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", metaDesc);
    upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", ogImage);
    upsertMeta('meta[property="article:section"]', "property", "article:section", getArticleSection(seo));
    if (seo?.schema) upsertJsonLd(seo.schema);

    return () => {
      document.title = prevTitle;
      document.getElementById("kola-project-jsonld")?.remove();
    };
  }, [project, img, plainDesc]);
};

/* ══════════════════════════════════════════
   UI PRIMITIVES
══════════════════════════════════════════ */

const FadeUp = memo(({
  children, delay = 0, className = "",
}: {
  children: React.ReactNode; delay?: number; className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
});

const LineReveal = memo(({
  children, delay = 0, className = "",
}: {
  children: React.ReactNode; delay?: number; className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "100%" }}
        animate={inView ? { y: 0 } : {}}
        transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
        {children}
      </motion.div>
    </div>
  );
});

/* ══════════════════════════════════════════
   DRAG CAROUSEL
══════════════════════════════════════════ */

const DragCarousel = memo(({
  children, className = "",
}: {
  children: React.ReactNode; className?: string;
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragLeft, setDragLeft] = useState(-800);

  useEffect(() => {
    const measure = () => {
      if (!trackRef.current || !containerRef.current) return;
      const overflow = trackRef.current.scrollWidth - containerRef.current.offsetWidth;
      setDragLeft(overflow > 0 ? -overflow : 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [children]);

  return (
    <div ref={containerRef} className={className}
      style={{ overflow: "hidden", marginLeft: "-1rem", marginRight: "-1rem" }}>
      <motion.div ref={trackRef}
        drag="x"
        dragConstraints={{ left: dragLeft, right: 0 }}
        dragElastic={0.08}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
        style={{ display: "flex", gap: "12px", paddingLeft: "1rem", paddingRight: "1rem", width: "max-content", cursor: "grab" }}>
        {children}
      </motion.div>
    </div>
  );
});

/* ══════════════════════════════════════════
   FAQ ACCORDION
══════════════════════════════════════════ */

const FaqAccordion = memo(({ items }: { items: FaqItem[] }) => {
  const [open, setOpen] = useState<number | null>(null);
  const toggle = useCallback(
    (i: number) => setOpen((prev) => (prev === i ? null : i)),
    []
  );

  return (
    <div className="mt-1">
      {items.map((item, i) => (
        <div key={i}
          className={`border-t border-black/[0.07] ${i === items.length - 1 ? "border-b" : ""}`}>
          <button
            onClick={() => toggle(i)}
            className="w-full flex items-center justify-between gap-6 py-4 text-left group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/20 rounded-sm"
            aria-expanded={open === i}>
            <span className={`text-[13.5px] leading-snug tracking-[-0.01em] transition-colors duration-200 ${open === i ? "text-black" : "text-black/58 group-hover:text-black/85"}`}>
              {item.question}
            </span>
            <motion.span
              animate={{ rotate: open === i ? 45 : 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="shrink-0 text-black/25 group-hover:text-black/50 transition-colors">
              <Plus size={13} strokeWidth={1.4} />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div key="answer"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden">
                <p className="pb-4 pr-8 text-[13px] text-black/45 leading-[1.8] tracking-[-0.005em]">
                  {item.answer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
});

/* ══════════════════════════════════════════
   VIEW LIVE SITE BUTTON
══════════════════════════════════════════ */

const ViewLiveButton = memo(({ href }: { href: string }) => {
  if (!href) return null;
  return (
    <FadeUp delay={0.06}>
      <div className="mt-10 mb-4">
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          initial="rest"
          whileHover="hover"
          animate="rest"
          className="group inline-flex items-center gap-2.5 px-6 py-3.5 bg-black text-white text-[13.5px] font-medium rounded-full shadow-sm hover:shadow-md hover:bg-black/90 transition-all duration-200 cursor-pointer"
        >
          <span>View live site</span>
          <span className="relative w-3.5 h-3.5 overflow-hidden">
            <motion.span
              variants={{ rest: { x: 0, y: 0, opacity: 1 }, hover: { x: 14, y: -14, opacity: 0 } }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <ArrowUpRight size={14} strokeWidth={2} />
            </motion.span>
            <motion.span
              variants={{ rest: { x: -14, y: 14, opacity: 0 }, hover: { x: 0, y: 0, opacity: 1 } }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <ArrowUpRight size={14} strokeWidth={2} />
            </motion.span>
          </span>
        </motion.a>
      </div>
    </FadeUp>
  );
});

/* ══════════════════════════════════════════
   START A PROJECT CTA BLOCK
══════════════════════════════════════════ */

// const InlineProjectCTA = memo(({ onOpenContact }: { onOpenContact: () => void }) => {
//   return (
//     <FadeUp delay={0.05}>
//       <div className="mt-16 pt-10 border-t border-black/[0.06]">
//         <p className="text-sm tracking-[0.22em] uppercase font-semibold mb-5">
//           Start a project
//         </p>
//         <p className="text-[21px] font-semibold tracking-[-0.03em] text-black leading-[1.18] mb-7 max-w-[300px]">
//           Let's build something that works for you.
//         </p>
//         <motion.button
//           onClick={onOpenContact}
//           initial="rest"
//           whileHover="hover"
//           animate="rest"
//           className="group relative overflow-hidden rounded-full p-4 inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-[13px] font-medium leading-none"
//         >
//           <span className="relative z-10 p-2">Start a Project</span>
//           <motion.span
//             variants={{ rest: { x: 0, y: 0 }, hover: { x: 3, y: -3 } }}
//             transition={{ duration: 0.18 }}
//             className="relative z-10"
//           >
//             <ArrowUpRight size={13} strokeWidth={1.8} />
//           </motion.span>
//           <motion.span
//             variants={{ rest: { x: "-110%", opacity: 0 }, hover: { x: "210%", opacity: 0.12 } }}
//             transition={{ duration: 0.45 }}
//             className="absolute inset-0 bg-white skew-x-12 pointer-events-none"
//           />
//         </motion.button>
//       </div>
//     </FadeUp>
//   );
// });

const InlineProjectCTA = memo(({ onOpenContact }: { onOpenContact: () => void }) => (
  <FadeUp delay={0.05}>
    {/* <div className="mt-16 pt-10 border-t border-black/[0.06]">
      <p className="text-[10px] tracking-[0.22em] uppercase text-black/28 font-semibold mb-5">
        Start a project
      </p>
      <p className="text-[21px] font-semibold tracking-[-0.03em] text-black leading-[1.18] mb-7 max-w-[300px]">
        Let's build something that works for you.
      </p>
      <motion.button onClick={onOpenContact}
        initial="rest" whileHover="hover" animate="rest"
        className="group relative overflow-hidden inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-[13px] font-medium leading-none">
        <span className="relative z-10">Start a Project</span>
        <motion.span variants={{ rest: { x: 0, y: 0 }, hover: { x: 3, y: -3 } }} transition={{ duration: 0.18 }} className="relative z-10">
          <ArrowUpRight size={13} strokeWidth={1.8} />
        </motion.span>
        <motion.span
          variants={{ rest: { x: "-110%", opacity: 0 }, hover: { x: "210%", opacity: 0.12 } }}
          transition={{ duration: 0.45 }}
          className="absolute inset-0 bg-white skew-x-12 pointer-events-none" />
      </motion.button>
    </div> */}
        <div className="rounded-[22px] pt-10 mt-16 bg-black text-white p-6 md:p-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold mb-3">
                   Start a project
                </h3>
                <p className="text-sm text-white/70">
                  Let's build something that works for you.
                </p>
              </div>
            </div>

            {/*  BUTTON BELOW  */}
            <div className="flex justify-center mt-8">
              <motion.button onClick={onOpenContact}
        initial="rest" whileHover="hover" animate="rest"
        className="group bg-white  relative overflow-hidden inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-[13px] font-medium leading-none">
        <span className="relative text-black z-10">Start a Project</span>
        <motion.span variants={{ rest: { x: 0, y: 0 }, hover: { x: 3, y: -3 } }} transition={{ duration: 0.18 }} className="relative text-black z-10">
          <ArrowUpRight size={13} strokeWidth={1.8} />
        </motion.span>
        <motion.span
          variants={{ rest: { x: "-110%", opacity: 0 }, hover: { x: "210%", opacity: 0.12 } }}
          transition={{ duration: 0.45 }}
          className="absolute inset-0 bg-white skew-x-12 pointer-events-none" />
      </motion.button>
            </div>
          </div>
  </FadeUp>
));
/* ══════════════════════════════════════════
   CONTENT SECTION BLOCK
══════════════════════════════════════════ */

const ContentSectionBlock = memo(({
  section,
  delay = 0,
  isFirst = false,
  liveUrl = "",
}: {
  section: ContentSection;
  delay?: number;
  isFirst?: boolean;
  liveUrl?: string;
}) => {
  const isFAQ = /faq|frequently asked/i.test(section.heading);
  const faqItems = isFAQ ? parseFaqItems(section.bodyHtml) : [];
  const hasHeading = section.heading.trim().length > 0;

  return (
    <FadeUp delay={delay}>
      <article className={`${isFirst ? "" : "mt-14"}`}>
        {hasHeading && (
          <LineReveal className="mb-5">
            <h3 className="m-0 p-0 text-xl font-medium text-black leading-none">
              {section.heading}
            </h3>
          </LineReveal>
        )}

        {isFAQ && faqItems.length > 0 ? (
          <FaqAccordion items={faqItems} />
        ) : (
          <div
            className="
              prose-section
              text-[14.5px] text-black/55 leading-[1.9] tracking-[-0.01em]
              [&>p]:block [&>p]:mb-5 [&>p:last-child]:mb-0
              [&>p]:text-black/55
              [&>ul]:mt-3 [&>ul]:mb-5 [&>ul]:space-y-2 [&>ul]:pl-0 [&>ul]:list-none
              [&>ul>li]:flex [&>ul>li]:gap-2.5 [&>ul>li]:text-black/50
              [&>ul>li]:before:content-['—'] [&>ul>li]:before:text-black/20
              [&>ul>li]:before:shrink-0
              [&>ol]:mt-3 [&>ol]:mb-5 [&>ol]:space-y-2 [&>ol]:pl-4
              [&>ol>li]:text-black/50
              [&_strong]:text-black/75 [&_strong]:font-medium
              [&_a]:text-black [&_a]:underline [&_a]:underline-offset-2
              [&_a:hover]:text-black/55
            "
            dangerouslySetInnerHTML={{ __html: formatBodyHtml(section.bodyHtml) }}
          />
        )}
      </article>
    </FadeUp>
  );
});

/* ══════════════════════════════════════════
   BLOG SIDEBAR CARD (NUMBERED ARTICLE)
══════════════════════════════════════════ */
const BlogSidebarCard = memo(({ post, index }: { post: NormalizedBlog; index: number }) => {
  const navigate = useNavigate();
  const num = String(index + 1).padStart(2, "0");
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => navigate(`/${post.slug}`)}
      className="group cursor-pointer py-3 border-b border-black/[0.06] last:border-b-0 flex items-start gap-3.5 transition-colors"
    >
      <span className="text-[19px] font-semibold tracking-tight text-black/20 group-hover:text-black transition-colors shrink-0 select-none leading-none pt-0.5">
        {num}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-medium text-black group-hover:text-black/55 transition-colors duration-200 leading-[1.35]">
          {post.title}
        </p>
      </div>
    </motion.div>
  );
});

/* ══════════════════════════════════════════
   PROJECT PAGE
══════════════════════════════════════════ */

const ProjectPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<WPProject | null>(() => {
    if (typeof window !== "undefined" && (window as any).__INITIAL_DATA__?.project?.slug === slug) {
      return (window as any).__INITIAL_DATA__.project;
    }
    return null;
  });
  const [otherProjects, setOtherProjects] = useState<NormalizedProject[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<NormalizedBlog[]>([]);
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined" && (window as any).__INITIAL_DATA__?.project?.slug === slug) {
      return false;
    }
    return true;
  });
  const [notFound, setNotFound] = useState(false);
  const [contactFormOpen, setContactFormOpen] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  const featuredImg =
    project?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ??
    project?.acf?.hover_img ??
    project?.acf?.images?.[0] ??
    getSchemaImageUrl(project?.aioseo_head_json) ??
    "";
  const altText =
    project?._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ??
    (project ? decodeHtmlEntities(project.title.rendered) : "");
  const plainDesc = project
    ? stripHtml(
        project.content?.rendered ||
        project.acf?.client_requirement_solution ||
        project.acf?.content ||
        ""
      ).slice(0, 160)
    : "";

  useProjectSEO(project, featuredImg, plainDesc);

  useEffect(() => {
    if (!slug) return;
    if (project && project.slug === slug) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true); setNotFound(false); setProject(null);

    fetch(`${WP_API_BASE}/project?slug=${encodeURIComponent(slug)}&_embed=1`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() as Promise<WPProject[]>; })
      .then((data) => { if (cancelled) return; if (!data.length) setNotFound(true); else setProject(data[0]); })
      .catch(() => { if (!cancelled) setNotFound(true); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    fetch(`${WP_API_BASE}/project?per_page=6&_embed=1`)
      .then((r) => r.json() as Promise<WPProject[]>)
      .then((data) => {
        if (!cancelled && Array.isArray(data))
          setOtherProjects(
            data.filter((p) => p.slug !== slug).slice(0, 3).map(normalizeOther)
          );
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${WP_API_BASE}/posts?per_page=8&_embed=1`)
      .then((r) => r.json() as Promise<any[]>)
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setLatestBlogs(data.map(normalizeBlog).slice(0, 6));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Loading />;

  if (notFound || !project)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-black/50 text-sm">Project not found.</p>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-black hover:text-black/60 transition-colors">
          <ArrowLeft size={14} /> Go back
        </button>
      </div>
    );

  const rawContent =
    (project.content?.rendered && project.content.rendered.trim().length > 0)
      ? project.content.rendered
      : (project.acf?.client_requirement_solution || project.acf?.content || "");

  const liveUrl =
    project.acf?.live_url ??
    project.acf?.liveUrl ??
    project.acf?.project_link ??
    extractContentLiveUrl(rawContent) ??
    "";

  const cleanedContent = removeContentLiveParagraph(rawContent);

  const articleSection = getArticleSection(project.aioseo_head_json);
  const allTerms = (project as any)._embedded?.["wp:term"]?.flat() || [];
  
  const termCategories: Array<{ name: string; slug: string }> = allTerms
    .filter((t: any) => t?.taxonomy === "project-category")
    .map((t: any) => ({
      name: decodeHtmlEntities(t?.name ?? ""),
      slug: t?.slug ?? String(t?.name ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    }))
    .filter((t: any) => Boolean(t.name));

  const termTags: Array<{ name: string; slug: string }> = allTerms
    .filter((t: any) => t?.taxonomy === "project-tag")
    .map((t: any) => ({
      name: decodeHtmlEntities(t?.name ?? ""),
      slug: t?.slug ?? String(t?.name ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    }))
    .filter((t: any) => Boolean(t.name));

  const acfTags: Array<{ name: string; slug: string }> =
    (project.acf?.tags?.map(decodeHtmlEntities) ?? []).map((t: string) => ({
      name: t,
      slug: t.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    }));

  const sectionTags: Array<{ name: string; slug: string }> = (articleSection
    ? articleSection.split(",").map((t) => decodeHtmlEntities(t.trim())).filter(Boolean)
    : []).map((t: string) => ({
      name: t,
      slug: t.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    }));

  const categories: Array<{ name: string; slug: string }> = termCategories.length > 0
    ? termCategories
    : (sectionTags.length > 0 ? sectionTags : acfTags);

  const tags: Array<{ name: string; slug: string }> = Array.from(
    new Map(
      [...termTags, ...acfTags].map((item) => [item.slug, item])
    ).values()
  );

  const hoverImg = project.acf?.hover_img ?? featuredImg;
  const extraImages: string[] = project.acf?.images ?? [];
  const allImages = [featuredImg, hoverImg, ...extraImages]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i);

  const sections = parseContentSections(cleanedContent);
  const displayTitle = decodeHtmlEntities(project.title.rendered);
  const hasFaqSection = sections.some((s) => /faq|frequently asked/i.test(s.heading));

  return (
    <div className="min-h-screen bg-white">
      <CustomCursor />
      <div className="relative">
        <ColumnGuides />

        {/* ═══════════════ MAIN 2-COLUMN SECTION ═══════════════ */}
        <section ref={heroRef} className="section-container pt-24 pb-28 relative z-10">
          <div className="max-w-[1140px] mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] lg:grid-cols-[1fr_290px] items-start gap-8 lg:gap-14">

              {/* ── LEFT COLUMN ── */}
              <div className="min-w-0">

                {/* BACK */}
                <FadeUp delay={0}>
                  <motion.button onClick={() => navigate(-1)}
                    initial="rest" whileHover="hover" animate="rest"
                    className="mb-8 flex items-center gap-2 text-sm text-black/35 hover:text-black transition-colors">
                    <span className="relative w-4 h-4 overflow-hidden">
                      <motion.span
                        variants={{ rest: { x: 0, y: 0, opacity: 1 }, hover: { x: -16, y: 16, opacity: 0 } }}
                        className="absolute">
                        <ArrowLeft size={14} />
                      </motion.span>
                      <motion.span
                        variants={{ rest: { x: 16, y: -16, opacity: 0 }, hover: { x: 0, y: 0, opacity: 1 } }}
                        className="absolute">
                        <ArrowLeft size={14} />
                      </motion.span>
                    </span>
                    Back
                  </motion.button>
                </FadeUp>

                {/* TITLE */}
                <div className="mb-4">
                  <AnimatedHeading
                    lines={["", displayTitle]}
                    className="md:hidden text-[clamp(2rem,8vw,2.8rem)] leading-[1.05] tracking-[-0.03em] font-semibold"
                  />
                  <AnimatedHeading
                    lines={["", displayTitle]}
                    className="hidden md:block text-[clamp(2.2rem,4vw,3.2rem)] leading-[1.05] tracking-[-0.03em] font-semibold"
                  />
                </div>

                {/* CATEGORIES / TAGS (BELOW TITLE) */}
                {categories.length > 0 && (
                  <FadeUp delay={0.08}>
                    <div className="flex flex-wrap gap-2 pb-6">
                      {categories.slice(0, 3).map((cat) => (
                        <motion.button
                          key={cat.slug}
                          type="button"
                          onClick={() => navigate(`/project-category/${encodeURIComponent(cat.slug)}`)}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="inline-block px-3 py-1 text-[11.5px] border border-black/[0.12] rounded-full text-black/40 tracking-wide hover:border-black/30 hover:text-black/70 hover:bg-black/[0.03] transition-colors duration-150 cursor-pointer"
                        >
                          {cat.name}
                        </motion.button>
                      ))}
                    </div>
                  </FadeUp>
                )}

                {/* DESKTOP HERO IMAGE */}
                {featuredImg && featuredImg !== "/placeholder.jpg" && (
                  <motion.div
                    className="hidden md:block overflow-hidden mb-8 w-full rounded-2xl border border-black/[0.08]"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <motion.img
                      src={featuredImg}
                      alt={altText}
                      style={{ y: imgY, scale: imgScale }}
                      className="w-full h-[400px] lg:h-[460px] object-cover"
                      loading="eager"
                      onError={(e) => {
                        (e.currentTarget.parentElement as HTMLElement)?.remove();
                      }}
                    />
                  </motion.div>
                )}

                {/* MOBILE CAROUSEL */}
                {allImages.filter((img) => img && img !== "/placeholder.jpg").length > 0 && (
                  <div className="md:hidden mb-6">
                    <DragCarousel>
                      {allImages.filter((img) => img && img !== "/placeholder.jpg").map((src, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0, y: 18, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                          style={{ width: "82vw", flexShrink: 0 }}
                          className="overflow-hidden rounded-[18px]">
                          <img
                            src={src}
                            alt={`${displayTitle} ${i + 1}`}
                            className="w-full h-[240px] object-cover"
                            loading={i === 0 ? "eager" : "lazy"}
                            onError={(e) => {
                              (e.currentTarget.parentElement as HTMLElement)?.remove();
                            }}
                          />
                        </motion.div>
                      ))}
                    </DragCarousel>
                  </div>
                )}

                {/* CONTENT SECTIONS */}
                <div className="pt-2">
                  {sections.length > 0 ? (
                    sections.map((section, idx) => (
                      <ContentSectionBlock
                        key={`${section.heading}-${idx}`}
                        section={section}
                        delay={0.04 + idx * 0.06}
                        isFirst={idx === 0}
                        liveUrl={liveUrl}
                      />
                    ))
                  ) : (
                    <FadeUp delay={0.05}>
                      <div
                        className="text-[14.5px] text-black/55 leading-[1.9] [&>p]:mb-5 [&>p:last-child]:mb-0"
                        dangerouslySetInnerHTML={{ __html: cleanedContent }}
                      />
                    </FadeUp>
                  )}

                  {liveUrl && (
                    <ViewLiveButton href={liveUrl} />
                  )}

                  {/* TAGS AT END */}
                  {tags.length > 0 && (
                    <FadeUp delay={0.1}>
                      <div className="mt-12 pt-8 border-t border-black/[0.07] mb-10">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-black/40 font-semibold mb-3.5">
                          Tags
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <motion.button
                              key={tag.slug}
                              type="button"
                              onClick={() =>
                                navigate(`/project-tag/${encodeURIComponent(tag.slug)}`)
                              }
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.96 }}
                              transition={{ duration: 0.15 }}
                              className="inline-block px-3 py-1 text-[11.5px] border border-black/[0.1] rounded-full text-black/55 bg-black/[0.02] tracking-wide hover:border-black/25 hover:text-black hover:bg-black/[0.04] transition-colors duration-150 cursor-pointer"
                            >
                              #{tag.name}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </FadeUp>
                  )}

                  <div className="hidden md:block">
                    <InlineProjectCTA onOpenContact={() => setContactFormOpen(true)} />
                  </div>

                  {/* ── MOBILE: other projects carousel FIRST ── */}
                  {otherProjects.length > 0 && (
                    <div className="md:hidden mt-14">
                      <p className="text-[10.5px] uppercase tracking-[0.2em] text-black/28 font-semibold mb-5">
                        Other Projects
                      </p>
                      <DragCarousel>
                        {otherProjects.map((p, i) => (
                          <motion.div key={p.slug}
                            initial={{ opacity: 0, y: 18, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            onClick={() => navigate(`/${p.slug}`)}
                            style={{ width: "70vw", flexShrink: 0 }}
                            className="cursor-pointer group flex items-center gap-4">
                            <div className="relative overflow-hidden rounded-[8px] w-[80px] h-[80px] shrink-0">
                              <img src={p.img} alt={p.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-black leading-snug group-hover:text-black/50 transition-colors">{p.title}</p>
                              {p.category && (
                                <span className="inline-block px-2.5 py-1 mt-1.5 text-[10.5px] border border-black/[0.1] rounded-full text-black/45 bg-black/[0.02]">{p.category}</span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </DragCarousel>
                    </div>
                  )}

                  {/* ── MOBILE: Latest Articles Carousel SECOND ── */}
                  {latestBlogs.length > 0 && (
                    <div className="md:hidden mt-14">
                      <p className="text-[10.5px] uppercase tracking-[0.2em] text-black/28 font-semibold mb-5">
                        Latest Articles
                      </p>
                      <DragCarousel>
                        {latestBlogs.map((p, i) => (
                          <motion.div
                            key={p.slug}
                            initial={{ opacity: 0, y: 18, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                              delay: i * 0.08,
                              duration: 0.5,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            onClick={() => navigate(`/${p.slug}`)}
                            style={{ width: "68vw", flexShrink: 0 }}
                            className="cursor-pointer group"
                          >
                            <div className="relative overflow-hidden rounded-2xl mb-3 h-[130px]">
                              <img
                                src={p.img}
                                alt={p.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                              <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                                <ArrowUpRight size={11} />
                              </div>
                            </div>
                            <p className="text-[13px] font-medium text-black leading-snug group-hover:text-black/50 transition-colors mt-3">
                              {p.title}
                            </p>
                          </motion.div>
                        ))}
                      </DragCarousel>
                    </div>
                  )}

                  <div className="md:hidden mt-10">
                    <InlineProjectCTA onOpenContact={() => setContactFormOpen(true)} />
                  </div>
                </div>

              </div>

              {/* ── RIGHT COLUMN: STICKY SIDEBAR (FROM TOP OF PAGE) ── */}
              {(otherProjects.length > 0 || latestBlogs.length > 0) && (
                <aside className="hidden md:block sticky top-24 space-y-8 self-start pt-2">
                  {/* 1. OTHER PROJECTS FIRST (TOP) - SHOWING 3 */}
                  {otherProjects.length > 0 && (
                    <div>
                      <LineReveal className="mb-3">
                        <p className="text-[10.5px] uppercase tracking-[0.2em] text-black/28 font-semibold">
                          Other Projects
                        </p>
                      </LineReveal>
                      <div className="flex flex-col">
                        {otherProjects.slice(0, 3).map((p, i) => (
                          <motion.div key={p.slug}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            onClick={() => navigate(`/${p.slug}`)}
                            className="group cursor-pointer py-3 border-b border-black/[0.06] last:border-b-0 flex items-center gap-4">
                            <div className="relative overflow-hidden rounded-[8px] w-[80px] h-[80px] shrink-0">
                              <img src={p.img} alt={p.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                                loading="lazy" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors duration-300 rounded-[8px]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12.5px] font-medium text-black group-hover:text-black/45 transition-colors duration-200 leading-snug">
                                {p.title}
                              </p>
                              {p.category && (
                                <span className="inline-block px-2.5 py-1 mt-1.5 text-[10.5px] border border-black/[0.1] rounded-full text-black/45 bg-black/[0.02]">{p.category}</span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. LATEST ARTICLES SECOND - SHOWING 6 WITH BORDER */}
                  {latestBlogs.length > 0 && (
                    <div className="border border-black/[0.08] rounded-2xl p-5 bg-black/[0.015]">
                      <LineReveal className="mb-3">
                        <p className="text-[10.5px] uppercase tracking-[0.2em] text-black/40 font-semibold">
                          Latest Articles
                        </p>
                      </LineReveal>
                      <div className="flex flex-col">
                        {latestBlogs.slice(0, 6).map((post, i) => (
                          <BlogSidebarCard key={post.slug} post={post} index={i} />
                        ))}
                      </div>
                      <motion.button
                        onClick={() => navigate("/blogs")}
                        whileHover={{ x: 2 }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                        className="mt-4 text-[11.5px] text-black/35 hover:text-black transition-colors flex items-center justify-between font-medium pt-3 border-t border-black/[0.06] w-full"
                      >
                        <span>View all articles</span>
                        <ArrowUpRight size={11} />
                      </motion.button>
                    </div>
                  )}
                </aside>
              )}

            </div>
          </div>
        </section>
      </div>
      <ContactForm open={contactFormOpen} onClose={() => setContactFormOpen(false)} />
      <CTAFooter />
    </div>
  );
};

export default ProjectPage;