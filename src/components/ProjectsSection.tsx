import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { setCachedSlugType } from "@/pages/SlugResolver";

const WP_API_BASE = "https://cms.kolacommunications.com/wp-json/wp/v2";
// Homepage shows these flagship clients, in this order.
const FEATURED_SLUGS = ["roy-infra-developers", "laser-technologies", "livyor", "dhanuka-investments"];
const PER_PAGE = FEATURED_SLUGS.length;

/* ─── Types ─── */
export interface ProjectTaxonomyItem {
  id?: number;
  name: string;
  slug: string;
  taxonomy?: string;
}

interface WPProject {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  featured_media: number;
  aioseo_head_json?: {
    title?: string;
    description?: string;
    keywords?: string;
    schema?: {
      articleSection?: string;
      "@graph"?: Array<{
        "@type": string;
        articleSection?: string;
        [key: string]: unknown;
      }>;
      [key: string]: unknown;
    };
  };
  acf?: {
    live_url?: string;
    hover_img?: string;
    tags?: string[];
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string }>;
    "wp:term"?: Array<Array<{
      id: number;
      name: string;
      slug: string;
      taxonomy: string;
      link?: string;
    }>>;
  };
}

interface NormalizedProject {
  id: number;
  slug: string;
  title: string;
  img: string;
  hoverImg: string;
  tags: ProjectTaxonomyItem[];
  categories: ProjectTaxonomyItem[];
  allTerms: ProjectTaxonomyItem[];
  liveUrl: string;
}

/* ─── Decode HTML entities (&#038; → &, &amp; → &, etc.) ─── */
const decodeHtmlEntities = (str: string): string => {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
};

/* ─── Extract articleSection from aioseo schema (mirrors ProjectPage logic) ─── */
const getArticleSection = (p: WPProject): string => {
  const schema = p.aioseo_head_json?.schema as any;
  if (!schema) return "";

  // @graph array — same structure ProjectPage uses
  if (Array.isArray(schema["@graph"])) {
    const article = schema["@graph"].find((n: any) => n["@type"] === "Article");
    if (article?.articleSection) return article.articleSection as string;
  }
  // Flat fallback
  if (typeof schema.articleSection === "string") return schema.articleSection;

  return "";
};

/* ─── Normalize WP response ─── */
const normalize = (p: WPProject): NormalizedProject => {
  if (p.slug) {
    setCachedSlugType(p.slug, "project");
  }
  const img =
    p._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? "/placeholder.jpg";

  const rawSection = getArticleSection(p);
  const categories: ProjectTaxonomyItem[] = [];
  const tags: ProjectTaxonomyItem[] = [];
  const seenSlugs = new Set<string>();

  if (Array.isArray(p._embedded?.["wp:term"])) {
    p._embedded["wp:term"].forEach((group) => {
      if (Array.isArray(group)) {
        group.forEach((term: any) => {
          if (term?.name) {
            const decodedName = decodeHtmlEntities(term.name);
            const slug = term.slug || decodedName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            const item: ProjectTaxonomyItem = {
              id: term.id,
              name: decodedName,
              slug,
              taxonomy: term.taxonomy,
            };
            if (term.taxonomy === "project-category" || term.taxonomy === "category") {
              categories.push(item);
            } else if (term.taxonomy === "project-tag" || term.taxonomy === "post_tag") {
              tags.push(item);
            } else {
              tags.push(item);
            }
          }
        });
      }
    });
  }

  // Fallback for tags if embedded terms didn't provide any
  if (tags.length === 0) {
    if (rawSection) {
      rawSection.split(",").map((t: string) => t.trim()).filter(Boolean).slice(0, 3).forEach((name) => {
        const decoded = decodeHtmlEntities(name);
        tags.push({
          name: decoded,
          slug: decoded.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          taxonomy: "project-tag",
        });
      });
    } else if (p.acf?.tags && Array.isArray(p.acf.tags)) {
      p.acf.tags.forEach((name) => {
        const decoded = decodeHtmlEntities(name);
        tags.push({
          name: decoded,
          slug: decoded.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          taxonomy: "project-tag",
        });
      });
    }
  }

  const allTerms: ProjectTaxonomyItem[] = [];
  [...categories, ...tags].forEach((t) => {
    if (!seenSlugs.has(t.slug)) {
      seenSlugs.add(t.slug);
      allTerms.push(t);
    }
  });

  return {
    id: p.id,
    slug: p.slug,
    title: decodeHtmlEntities(p.title.rendered),
    img,
    hoverImg: p.acf?.hover_img ?? img,
    tags,
    categories,
    allTerms,
    liveUrl: p.acf?.live_url ?? "",
  };
};

/* ─── Glitch hook ─── */
const useGlitch = () => {
  const [glitching, setGlitching] = useState(false);
  const trigger = useCallback(() => {
    setGlitching(true);
    setTimeout(() => setGlitching(false), 500);
  }, []);
  return { glitching, trigger };
};

/* ─── Glitch overlay ─── */
const GlitchOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 1, 0.4, 1, 0] }}
    transition={{ duration: 0.5 }}
    className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
  >
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        animate={{ x: [0, -6 + i * 4, 6 - i * 2, 0], opacity: [0, 0.6, 0.2, 0] }}
        transition={{ duration: 0.3, delay: i * 0.05 }}
        className="absolute inset-0"
        style={{
          background:
            i === 0
              ? "rgba(255,0,0,0.2)"
              : i === 1
              ? "rgba(0,255,0,0.15)"
              : "rgba(0,150,255,0.2)",
          mixBlendMode: "screen",
        }}
      />
    ))}
  </motion.div>
);

/* ─── Project card ─── */
const ProjectCard = ({
  project,
  index,
}: {
  project: NormalizedProject;
  index: number;
}) => {
  const { glitching, trigger } = useGlitch();
  const [hovered, setHovered] = useState(false);

  return (
    <Link to={`/${project.slug}`} style={{ textDecoration: "none" }}>
      <motion.article
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => { setHovered(true); trigger(); }}
        onMouseLeave={() => setHovered(false)}
        className="group relative isolate overflow-hidden rounded-xl border border-border bg-card
                   cursor-pointer transition-colors duration-300 hover:border-foreground/25"
      >
        {/* Header — the card leads with its name, not with the picture */}
        <div className="p-3 sm:px-5 sm:pt-4 sm:pb-4 flex items-center justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <h3 className="text-[13px] sm:text-[16px] md:text-[17px] font-semibold leading-tight tracking-[-0.01em] text-foreground mb-1 sm:mb-2 line-clamp-1 sm:line-clamp-none">
              {project.title}
            </h3>

            {project.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {project.categories.slice(0, 3).map((cat) => (
                  <span
                    key={`${cat.taxonomy || "cat"}-${cat.slug}`}
                    data-slug={cat.slug}
                    className="text-[10px] sm:text-[11.5px] font-normal px-2 py-[2px] sm:px-2.5 sm:py-[4px] whitespace-nowrap border border-border text-foreground/75 bg-background rounded-xl truncate max-w-full sm:max-w-none"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Arrow — plain, and it travels on hover */}
          <motion.span
            className="shrink-0 text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block"
            animate={{ x: hovered ? 2 : 0, y: hovered ? -2 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ArrowUpRight size={15} />
          </motion.span>
        </div>

        {/* Media — full bleed under the header, no scrim over it */}
        <div className="relative aspect-[3/2] overflow-hidden">
          <motion.img
            src={project.img}
            alt={project.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
            animate={{
              opacity: hovered && glitching ? 0 : 1,
              scale: hovered ? 1.04 : 1,
            }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.img
            src={project.hoverImg}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{
              opacity: hovered && !glitching ? 1 : 0,
              scale: hovered ? 1.04 : 1.1,
            }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
          <AnimatePresence>{glitching && <GlitchOverlay />}</AnimatePresence>
        </div>
      </motion.article>
    </Link>
  );
};

/* ─── Main Component ─── */
const ProjectsSection = () => {
  const [projects, setProjects] = useState<NormalizedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${WP_API_BASE}/project?slug=${FEATURED_SLUGS.join(",")}&per_page=${PER_PAGE}&_embed=1`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        if (cancelled) return;
        const data: WPProject[] = await res.json();
        const rank = (slug: string) => FEATURED_SLUGS.indexOf(slug);
        if (!cancelled) setProjects([...data].sort((a, b) => rank(a.slug) - rank(b.slug)).map(normalize));
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProjects();
    return () => { cancelled = true; };
  }, []);

  return (
    <section id="projects-section" className="py-12 section-container px-4 md:px-10">
      <h2 className="text-[clamp(2.2rem,4vw,3.2rem)] leading-[1.05] tracking-[-0.02em] mb-16 md:mb-20 max-w-[640px]">
        <span className="text-muted-foreground font-medium">Projects </span>
        <span className="text-foreground font-semibold">we're proud of.</span>
      </h2>

      <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6"
        >
          {loading
            ? Array.from({ length: PER_PAGE }).map((_, i) => (
                <div
                  key={i}
                  className="border border-border bg-card overflow-hidden animate-pulse rounded-xl"
                >
                  {/* Mirrors the card: header block, then media */}
                  <div className="p-3 sm:p-5 md:p-6">
                    <div className="h-4 sm:h-6 w-1/2 bg-black/5 mb-2 sm:mb-3" />
                    <div className="flex gap-1.5 sm:gap-2">
                      <div className="h-5 sm:h-7 w-16 sm:w-28 bg-black/5 rounded-full" />
                      <div className="h-5 sm:h-7 w-12 sm:w-24 bg-black/5 rounded-full" />
                    </div>
                  </div>
                  <div className="bg-black/5 aspect-[3/2]" />
                </div>
              ))
            : projects.map((p, i) => (
                <ProjectCard key={p.slug} project={p} index={i} />
              ))}
        </motion.div>

      {/* Full portfolio lives on its own page */}
      <div className="mt-10 md:mt-14 flex justify-center">
        <Link
          to="/projects"
          className="group inline-flex items-center gap-3 px-7 md:px-9 py-3.5 md:py-4 bg-black text-white text-[14px] font-medium hover:bg-black/85 shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-all"
        >
          <span>View all projects</span>
          <ArrowUpRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>
    </section>
  );
};

export default ProjectsSection;