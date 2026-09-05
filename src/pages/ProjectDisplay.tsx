import {
  useState,
  useEffect,
  useCallback,
  useRef,
  memo,
} from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useNavigate, Link, useLocation, useParams } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";
import { Helmet } from "react-helmet-async";

import ColumnGuides from "@/components/ColumnGuides";
import CustomCursor from "@/components/CustomCursor";
import CTAFooter from "@/components/CTAFooter";
import AnimatedHeading from "@/components/AnimatedHeading";
import { setCachedSlugType } from "./SlugResolver";

/* ══════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════ */

const WP_API_BASE = "https://cms.kolacommunications.com/wp-json/wp/v2";
const PER_PAGE = 6;

/* ══════════════════════════════════════════
   TYPES
══════════════════════════════════════════ */

export interface WPTaxonomyItem {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface ProjectTaxonomyItem {
  id?: number;
  name: string;
  slug: string;
  taxonomy?: string;
}

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
  schema?: AioseoSchema;
  [key: string]: unknown;
}

interface WPProject {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  featured_media: number;
  "project-category"?: number[];
  "project-tag"?: number[];
  aioseo_head_json?: AioseoHeadJson;
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
  categories: ProjectTaxonomyItem[];
  tags: ProjectTaxonomyItem[];
  allTerms: ProjectTaxonomyItem[];
  liveUrl: string;
}

interface FetchState {
  projects: NormalizedProject[];
  loading: boolean;
  totalPages: number;
  totalItems: number;
}

/* ══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */

const decodeHtmlEntities = (str: string): string => {
  if (typeof document === "undefined") return str;
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
};

const getArticleSection = (p: WPProject): string => {
  const schema = p.aioseo_head_json?.schema as AioseoSchema | undefined;
  if (!schema) return "";
  if (Array.isArray(schema["@graph"])) {
    const article = schema["@graph"].find(
      (n: any) => n["@type"] === "Article" || n["@type"] === "NewsArticle" || n["@type"] === "WebPage"
    );
    if (article?.articleSection) return article.articleSection as string;
  }
  if (typeof schema.articleSection === "string") return schema.articleSection;
  return "";
};

const normalizeProject = (p: WPProject): NormalizedProject => {
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
    categories,
    tags,
    allTerms,
    liveUrl: p.acf?.live_url ?? "",
  };
};

/* ══════════════════════════════════════════
   HOOKS
══════════════════════════════════════════ */

const useProjectCategories = () => {
  const [categories, setCategories] = useState<WPTaxonomyItem[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetch(`${WP_API_BASE}/project-category?per_page=50&hide_empty=true`)
      .then((r) => r.json() as Promise<WPTaxonomyItem[]>)
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setCategories(
            data
              .map((c) => ({ ...c, name: decodeHtmlEntities(c.name) }))
              .filter((c) => c.count > 0)
              .sort((a, b) => b.count - a.count)
          );
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return categories;
};

const useProjectTags = () => {
  const [tags, setTags] = useState<WPTaxonomyItem[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetch(`${WP_API_BASE}/project-tag?per_page=50&hide_empty=true`)
      .then((r) => r.json() as Promise<WPTaxonomyItem[]>)
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setTags(
            data
              .map((t) => ({ ...t, name: decodeHtmlEntities(t.name) }))
              .filter((t) => t.count > 0)
              .sort((a, b) => b.count - a.count)
          );
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return tags;
};

const useProjects = (
  page: number,
  categorySlug: string | null,
  tagSlug: string | null
): FetchState => {
  const [state, setState] = useState<FetchState>(() => {
    if (
      typeof window !== "undefined" &&
      (window as any).__INITIAL_DATA__?.projects &&
      page === 1 &&
      !categorySlug &&
      !tagSlug
    ) {
      return {
        projects: (window as any).__INITIAL_DATA__.projects.projects,
        loading: false,
        totalPages: (window as any).__INITIAL_DATA__.projects.totalPages,
        totalItems: (window as any).__INITIAL_DATA__.projects.totalItems,
      };
    }
    return { projects: [], loading: true, totalPages: 1, totalItems: 0 };
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));

    if (!categorySlug && !tagSlug) {
      fetch(`${WP_API_BASE}/project?per_page=${PER_PAGE}&page=${page}&_embed=1`)
        .then(async (r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const totalPages = Number(r.headers.get("X-WP-TotalPages") ?? 1);
          const totalItems = Number(r.headers.get("X-WP-Total") ?? 0);
          const data: WPProject[] = await r.json();
          if (!cancelled)
            setState({ projects: data.map(normalizeProject), loading: false, totalPages, totalItems });
        })
        .catch(() => { if (!cancelled) setState((s) => ({ ...s, loading: false })); });
    } else {
      fetch(`${WP_API_BASE}/project?per_page=100&_embed=1`)
        .then(async (r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const data: WPProject[] = await r.json();
          if (cancelled) return;
          const normalized = data.map(normalizeProject);
          const filtered = normalized.filter((p) => {
            if (categorySlug) {
              return p.categories.some(
                (c) =>
                  c.slug.toLowerCase() === categorySlug.toLowerCase() ||
                  c.name.toLowerCase() === categorySlug.toLowerCase()
              );
            }
            if (tagSlug) {
              return (
                p.tags.some(
                  (t) =>
                    t.slug.toLowerCase() === tagSlug.toLowerCase() ||
                    t.name.toLowerCase() === tagSlug.toLowerCase()
                ) ||
                p.allTerms.some(
                  (t) =>
                    t.slug.toLowerCase() === tagSlug.toLowerCase() ||
                    t.name.toLowerCase() === tagSlug.toLowerCase()
                )
              );
            }
            return true;
          });
          const totalItems = filtered.length;
          const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));
          const safePage = Math.min(page, totalPages);
          const start = (safePage - 1) * PER_PAGE;
          setState({
            projects: filtered.slice(start, start + PER_PAGE),
            loading: false,
            totalPages,
            totalItems,
          });
        })
        .catch(() => { if (!cancelled) setState((s) => ({ ...s, loading: false })); });
    }

    return () => { cancelled = true; };
  }, [page, categorySlug, tagSlug]);

  return state;
};

/* ══════════════════════════════════════════
   GLITCH HOOK + OVERLAY
══════════════════════════════════════════ */

const useGlitch = () => {
  const [glitching, setGlitching] = useState(false);
  const trigger = useCallback(() => {
    setGlitching(true);
    setTimeout(() => setGlitching(false), 500);
  }, []);
  return { glitching, trigger };
};

const GlitchOverlay = memo(() => (
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
            i === 0 ? "rgba(255,0,0,0.2)"
            : i === 1 ? "rgba(0,255,0,0.15)"
            : "rgba(0,150,255,0.2)",
          mixBlendMode: "screen",
        }}
      />
    ))}
  </motion.div>
));

/* ══════════════════════════════════════════
   PROJECT CARD ROW
══════════════════════════════════════════ */

interface ProjectCardRowProps {
  pair: NormalizedProject[];
  rowIndex: number;
  onCategoryClick: (slug: string) => void;
  onTagClick: (slug: string) => void;
}

const ProjectCardRow = memo(({ pair, rowIndex, onCategoryClick, onTagClick }: ProjectCardRowProps) => {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:gap-4 items-stretch"
      style={{ gridTemplateRows: "auto" }}
    >
      {pair.map((project, i) => (
        <ProjectCardSubgrid
          key={project.slug}
          project={project}
          index={rowIndex * 2 + i}
          onCategoryClick={onCategoryClick}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  );
});

/* ══════════════════════════════════════════
   PROJECT CARD SUBGRID
══════════════════════════════════════════ */

interface ProjectCardSubgridProps {
  project: NormalizedProject;
  index: number;
  onCategoryClick: (slug: string) => void;
  onTagClick: (slug: string) => void;
}

const ProjectCardSubgrid = memo(({ project, index, onCategoryClick, onTagClick }: ProjectCardSubgridProps) => {
  const { glitching, trigger } = useGlitch();
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group overflow-hidden rounded-xl border border-black/10 bg-white/5 backdrop-blur-xl relative flex flex-col h-full"
      onMouseEnter={() => { setHovered(true); trigger(); }}
      onMouseLeave={() => setHovered(false)}
    >
      {/* HEADER */}
      <div className="flex justify-between items-start p-3 sm:px-5 sm:py-4 gap-2 sm:gap-3">
        {/* LEFT */}
        <div className="min-w-0 flex-1 flex flex-col">
          {/* TITLE */}
          <Link
            to={`/${project.slug}`}
            className="text-[13px] sm:text-[15px] text-black font-medium leading-snug block hover:text-black/70 transition-colors line-clamp-1 sm:line-clamp-none"
          >
            {project.title}
          </Link>

          {/* CATEGORY BADGES */}
          {project.categories.length > 0 && (
            <div className="flex gap-1 sm:gap-1.5 mt-1 sm:mt-2 flex-wrap">
              {project.categories.slice(0, 2).map((cat) => (
                <button
                  key={`${cat.taxonomy || "cat"}-${cat.slug}`}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onCategoryClick(cat.slug);
                  }}
                  className="text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-0.5 text-black/50 border border-black/10 whitespace-nowrap leading-snug hover:border-black/30 hover:text-black transition-colors duration-150 rounded-xl cursor-pointer truncate max-w-full"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ARROW */}
        <Link
          to={`/${project.slug}`}
          className="relative w-4 h-4 overflow-hidden shrink-0 mt-0.5 hidden xs:block"
          tabIndex={-1}
        >
          <motion.span
            animate={hovered ? { x: 16, y: -16, opacity: 0 } : { x: 0, y: 0, opacity: 1 }}
            transition={{ duration: 0.18 }}
            className="absolute"
          >
            <ArrowUpRight size={16} className="text-black/50" />
          </motion.span>
          <motion.span
            animate={hovered ? { x: 0, y: 0, opacity: 1 } : { x: -16, y: 16, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute"
          >
            <ArrowUpRight size={16} className="text-black" />
          </motion.span>
        </Link>
      </div>

      {/* IMAGE */}
      <Link
        to={`/${project.slug}`}
        style={{ textDecoration: "none" }}
        className="mt-auto block flex-1"
      >
        <div className="relative w-full h-[140px] sm:h-[180px] md:h-[220px] overflow-hidden">
          <motion.img
            src={project.img}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover"
            animate={{ opacity: hovered && glitching ? 0 : 1 }}
          />

          <motion.img
            src={project.hoverImg}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{
              opacity: hovered && !glitching ? 1 : 0,
              scale: hovered ? 1 : 1.06
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />

          <AnimatePresence>
            {glitching && <GlitchOverlay />}
          </AnimatePresence>
        </div>
      </Link>
    </motion.div>
  );
});

/* ══════════════════════════════════════════
   SKELETON CARD
══════════════════════════════════════════ */

const SkeletonCard = memo(({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.05, duration: 0.3 }}
    className="border border-black/10 overflow-hidden rounded-xl flex flex-col"
  >
    <div className="p-3 sm:px-5 sm:py-4 border-b border-black/10 space-y-2">
      <div className="h-3.5 sm:h-4 bg-black/[0.06] rounded-sm w-3/4 animate-pulse" />
      <div className="flex gap-1.5">
        {[40, 60].map((w, i) => (
          <div key={i} className="h-4 sm:h-5 bg-black/[0.04] rounded-full animate-pulse" style={{ width: w }} />
        ))}
      </div>
    </div>
    <div className="h-[140px] sm:h-[180px] md:h-[220px] bg-black/[0.04] animate-pulse" />
  </motion.div>
));

/* ══════════════════════════════════════════
   FILTER TABS & BARS
══════════════════════════════════════════ */

type FilterMode = "category" | "tag";

const FilterModeTabs = memo(({ mode, onSwitch }: { mode: FilterMode; onSwitch: (m: FilterMode) => void }) => (
  <div className="flex gap-1 p-1 bg-black/[0.04] rounded-full w-fit">
    {(["category", "tag"] as FilterMode[]).map((m) => (
      <motion.button
        key={m}
        onClick={() => onSwitch(m)}
        whileTap={{ scale: 0.96 }}
        className={`px-4 py-1.5 text-[12px] font-medium rounded-full transition-all duration-200 capitalize ${
          mode === m ? "bg-white text-black shadow-sm" : "text-black/45 hover:text-black"
        }`}
      >
        {m === "category" ? "Categories" : "Tags"}
      </motion.button>
    ))}
  </div>
));

interface DesktopFilterBarProps {
  items: WPTaxonomyItem[];
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
}

const DesktopFilterBar = memo(({ items, activeSlug, onSelect }: DesktopFilterBarProps) => {
  if (!items.length) return null;
  return (
    <div className="hidden md:flex flex-wrap gap-2">
      <motion.button
        onClick={() => onSelect(null)}
        whileTap={{ scale: 0.95 }}
        className={`px-4 py-1.5 text-[12px] font-medium border rounded-full transition-all duration-200 whitespace-nowrap ${
          !activeSlug
            ? "bg-black text-white border-black"
            : "text-black/50 border-black/[0.12] hover:border-black/30 hover:text-black"
        }`}
      >
        All
      </motion.button>
      {items.map((item) => (
        <motion.button
          key={item.slug}
          onClick={() => onSelect(item.slug === activeSlug ? null : item.slug)}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-1.5 text-[12px] font-medium border rounded-full transition-all duration-200 whitespace-nowrap ${
            activeSlug === item.slug
              ? "bg-black text-white border-black"
              : "text-black/50 border-black/[0.12] hover:border-black/30 hover:text-black"
          }`}
        >
          {item.name}
        </motion.button>
      ))}
    </div>
  );
});

interface MobileDropdownProps {
  items: WPTaxonomyItem[];
  activeSlug: string | null;
  placeholder: string;
  onSelect: (slug: string | null) => void;
}

const MobileDropdown = memo(({ items, activeSlug, placeholder, onSelect }: MobileDropdownProps) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const syncRect = useCallback(() => {
    if (triggerRef.current) setTriggerRect(triggerRef.current.getBoundingClientRect());
  }, []);

  useEffect(() => {
    if (!open) return;
    syncRect();
    window.addEventListener("scroll", syncRect, true);
    window.addEventListener("resize", syncRect);
    return () => {
      window.removeEventListener("scroll", syncRect, true);
      window.removeEventListener("resize", syncRect);
    };
  }, [open, syncRect]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      const panel = document.getElementById("pd-mobile-panel");
      if (!triggerRef.current?.contains(t) && !panel?.contains(t)) {
        setOpen(false);
      }
    };
    const timer = setTimeout(() => document.addEventListener("mousedown", handler), 10);
    return () => { clearTimeout(timer); document.removeEventListener("mousedown", handler); };
  }, [open]);

  const activeName = items.find((i) => i.slug === activeSlug)?.name ?? null;

  const panel =
    open && triggerRect
      ? createPortal(
          <AnimatePresence>
            <motion.div
              id="pd-mobile-panel"
              key="pd-panel"
              initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -4, scaleY: 0.97 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "fixed",
                top: triggerRect.bottom + 6,
                left: triggerRect.left,
                width: triggerRect.width,
                zIndex: 99999,
                transformOrigin: "top center",
              }}
              className="bg-white border border-black/[0.12] rounded-xl shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto"
            >
              <button
                onClick={() => { onSelect(null); setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3.5 text-[13px] border-b border-black/[0.07] transition-colors duration-100 ${
                  !activeSlug
                    ? "text-black font-semibold bg-black/[0.04]"
                    : "text-black/55 hover:bg-black/[0.02] hover:text-black"
                }`}
              >
                <span>{placeholder}</span>
                {!activeSlug && <span className="w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />}
              </button>

              {items.map((item, i) => (
                <button
                  key={item.slug}
                  onClick={() => { onSelect(item.slug === activeSlug ? null : item.slug); setOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-[13px] transition-colors duration-100 ${
                    i < items.length - 1 ? "border-b border-black/[0.05]" : ""
                  } ${
                    activeSlug === item.slug
                      ? "text-black font-semibold bg-black/[0.04]"
                      : "text-black/55 hover:bg-black/[0.02] hover:text-black"
                  }`}
                >
                  <span>{item.name}</span>
                  {activeSlug === item.slug && <span className="w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />}
                </button>
              ))}
            </motion.div>
          </AnimatePresence>,
          document.body
        )
      : null;

  return (
    <div className="md:hidden">
      <motion.button
        ref={triggerRef}
        onClick={() => { syncRect(); setOpen((o) => !o); }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 border border-black/[0.15] rounded-lg text-[13px] bg-white shadow-sm"
      >
        <span className={activeSlug ? "text-black font-medium" : "text-black/45"}>
          {activeName ?? placeholder}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {activeSlug && (
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(null); setOpen(false); }}
              className="text-black/30 hover:text-black/60 transition-colors p-0.5"
              aria-label="Clear filter"
            >
              <X size={12} strokeWidth={2} />
            </button>
          )}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <ChevronDown size={14} className="text-black/40" />
          </motion.span>
        </div>
      </motion.button>

      {panel}
    </div>
  );
});

/* ══════════════════════════════════════════
   ACTIVE FILTER BADGE
══════════════════════════════════════════ */

const ActiveFilterBadge = memo(({ label, onClear }: { label: string; onClear: () => void }) => (
  <motion.div
    key={label}
    initial={{ opacity: 0, scale: 0.9, y: -4 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, y: -4 }}
    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[11.5px] rounded-full font-medium"
  >
    <span>{label}</span>
    <button onClick={onClear} className="hover:opacity-70 transition-opacity" aria-label="Remove filter">
      <X size={10} strokeWidth={2} />
    </button>
  </motion.div>
));

/* ══════════════════════════════════════════
   RESULTS COUNT
══════════════════════════════════════════ */

const ResultsCount = memo(({ total, loading, filterLabel }: {
  total: number; loading: boolean; filterLabel: string | null;
}) => {
  if (loading) return null;
  return (
    <motion.p
      key={`${total}-${filterLabel}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-[11.5px] text-black/30 tracking-wide"
    >
      {total} {total === 1 ? "project" : "projects"}
      {filterLabel ? ` in "${filterLabel}"` : ""}
    </motion.p>
  );
});

/* ══════════════════════════════════════════
   PAGINATION
══════════════════════════════════════════ */

const PaginationBtn = memo(({ onClick, disabled, active, children }: {
  onClick: () => void; disabled?: boolean; active?: boolean; children: React.ReactNode;
}) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    whileTap={!disabled ? { scale: 0.9 } : {}}
    className={`inline-flex items-center justify-center w-9 h-9 text-sm border transition-colors duration-150 ${
      active
        ? "border-black bg-black text-white"
        : "border-black/10 text-black/60 hover:border-black/30 hover:text-black"
    } disabled:opacity-30 disabled:cursor-not-allowed`}
  >
    {children}
  </motion.button>
));

const Pagination = memo(({ page, totalPages, onPageChange }: {
  page: number; totalPages: number; onPageChange: (p: number) => void;
}) => {
  if (totalPages <= 1) return null;
  const getPages = (): (number | "…")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mt-16 flex items-center justify-center gap-2"
    >
      <PaginationBtn onClick={() => onPageChange(page - 1)} disabled={page === 1}>
        <ChevronLeft size={14} />
      </PaginationBtn>
      {getPages().map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="w-9 text-center text-black/30 text-sm">…</span>
        ) : (
          <PaginationBtn key={p} onClick={() => onPageChange(p as number)} active={p === page}>
            {p}
          </PaginationBtn>
        )
      )}
      <PaginationBtn onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>
        <ChevronRight size={14} />
      </PaginationBtn>
    </motion.div>
  );
});

/* ══════════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════════ */

const EmptyState = memo(({ filterLabel, onClear }: { filterLabel: string; onClear: () => void }) => (
  <motion.div
    key="empty"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.4 }}
    className="col-span-full py-24 flex flex-col items-center justify-center gap-4"
  >
    <p className="text-black/30 text-sm tracking-wide">
      No projects found for{" "}
      <span className="text-black/60 font-medium">"{filterLabel}"</span>
    </p>
    <button
      onClick={onClear}
      className="flex items-center gap-1.5 text-xs text-black/40 hover:text-black transition-colors"
    >
      <X size={12} /> Clear filter
    </button>
  </motion.div>
));

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */

const ProjectDisplay = () => {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isCategoryRoute = location.pathname.startsWith("/project-category");
  const isTagRoute = location.pathname.startsWith("/project-tag");
  const categoryParam = searchParams.get("category");
  const tagParam = searchParams.get("tag");
  const pageParam = Number(searchParams.get("page") ?? 1);

  const [filterMode, setFilterMode] = useState<FilterMode>(() =>
    isTagRoute || tagParam ? "tag" : "category"
  );
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(
    isCategoryRoute && routeSlug ? routeSlug : categoryParam
  );
  const [activeTagSlug, setActiveTagSlug] = useState<string | null>(
    isTagRoute && routeSlug ? routeSlug : tagParam
  );
  const [page, setPage] = useState<number>(Math.max(1, pageParam));

  const categories = useProjectCategories();
  const tags = useProjectTags();

  useEffect(() => {
    if (isCategoryRoute && routeSlug) {
      setFilterMode("category");
      setActiveCategorySlug(routeSlug);
      setActiveTagSlug(null);
    } else if (isTagRoute && routeSlug) {
      setFilterMode("tag");
      setActiveTagSlug(routeSlug);
      setActiveCategorySlug(null);
    } else if (categoryParam) {
      setFilterMode("category");
      setActiveCategorySlug(categoryParam);
      setActiveTagSlug(null);
    } else if (tagParam) {
      setFilterMode("tag");
      setActiveTagSlug(tagParam);
      setActiveCategorySlug(null);
    } else {
      setActiveCategorySlug(null);
      setActiveTagSlug(null);
    }
    setPage(Math.max(1, pageParam));
  }, [isCategoryRoute, isTagRoute, routeSlug, categoryParam, tagParam, pageParam]);

  const { projects, loading, totalPages, totalItems } = useProjects(
    page,
    activeCategorySlug,
    activeTagSlug
  );

  const scrollToTop = useCallback(() => {
    setTimeout(() => {
      document.getElementById("projects-display")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);
  }, []);

  const handleCategorySelect = useCallback(
    (slug: string | null) => {
      setActiveCategorySlug(slug);
      setActiveTagSlug(null);
      setPage(1);
      if (slug) {
        navigate(`/project-category/${encodeURIComponent(slug)}`);
      } else {
        navigate("/projects");
      }
      scrollToTop();
    },
    [navigate, scrollToTop]
  );

  const handleTagSelect = useCallback(
    (slug: string | null) => {
      setActiveTagSlug(slug);
      setActiveCategorySlug(null);
      setPage(1);
      if (slug) {
        navigate(`/project-tag/${encodeURIComponent(slug)}`);
      } else {
        navigate("/projects");
      }
      scrollToTop();
    },
    [navigate, scrollToTop]
  );

  const handleModeSwitch = useCallback(
    (newMode: FilterMode) => {
      setFilterMode(newMode);
      setActiveCategorySlug(null);
      setActiveTagSlug(null);
      setPage(1);
      navigate("/projects");
      scrollToTop();
    },
    [navigate, scrollToTop]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      const params = new URLSearchParams(location.search);
      if (newPage > 1) {
        params.set("page", String(newPage));
      } else {
        params.delete("page");
      }
      const searchStr = params.toString() ? `?${params.toString()}` : "";
      navigate(`/projects${searchStr}`, { replace: true });
      scrollToTop();
    },
    [location.search, navigate, scrollToTop]
  );

  const activeFilterLabel =
    activeCategorySlug
      ? categories.find((c) => c.slug === activeCategorySlug)?.name ?? activeCategorySlug
      : activeTagSlug
      ? tags.find((t) => t.slug === activeTagSlug)?.name ?? activeTagSlug
      : null;

  const gridKey = `${activeCategorySlug ?? ""}-${activeTagSlug ?? ""}-${page}`;

  // Chunk projects into pairs for row-level subgrid alignment
  const projectRows = Array.from(
    { length: Math.ceil(projects.length / 2) },
    (_, i) => projects.slice(i * 2, i * 2 + 2)
  );

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Our Work | Kola Communications Project Portfolio</title>
        <meta name="description" content="Kola Communications portfolio — 100+ WordPress, Shopify and custom coded websites for brands in India, UK, USA, UAE and Australia. Plus SEO, AEO and lead gen." />
        <meta name="keywords" content="Kola Communications Portfolio, Kola Communications Projects, Kola Communications Case Studies, Website Portfolio Mumbai, WordPress Website Portfolio India, Shopify Store Portfolio India, Custom Coded Website Portfolio, Digital Marketing Portfolio Mumbai, Web Design Portfolio India, SEO Portfolio India, AEO Projects India, Lead Generation Portfolio India, Website Development Portfolio India, Kola Client Projects, Website Projects India, Kola Communications Work, Web Agency Portfolio Mumbai, E-commerce Website Portfolio India, WordPress Projects India, Shopify Projects India, Custom Website Projects India, Digital Agency Portfolio India, Kola Communications Clients, Brand Website Portfolio India, Website Design Case Studies India" />
        <meta property="og:title" content="Our Work | Kola Communications Project Portfolio" />
        <meta property="og:description" content="Kola Communications portfolio — 100+ WordPress, Shopify and custom coded websites for brands in India, UK, USA, UAE and Australia. Plus SEO, AEO and lead gen." />
        <meta property="og:url" content="https://www.kolacommunications.com/projects" />
        <meta property="og:image" content="https://www.kolacommunications.com/og-image.jpg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.kolacommunications.com/projects" />
      </Helmet>
      <CustomCursor />
      <div className="relative overflow-hidden">
        <ColumnGuides />

        {/* ═══════════════ HEADER ═══════════════ */}
        <section
          id="projects-display"
          className="section-container pt-28 pb-0 relative z-10"
        >
          <div className="max-w-[1100px] mx-auto px-4 md:px-10">

            <motion.button
              onClick={() => navigate(-1)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mb-10 flex items-center gap-2 text-sm text-black/35 hover:text-black transition-colors"
            >
              <ChevronLeft size={14} />
              Back
            </motion.button>

            <AnimatedHeading
              lines={["Projects", "we're proud of."]}
              className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.05] tracking-[-0.02em] max-w-[640px] mb-10 md:mt-4"
              stagger={0.07}
              duration={0.7}
              blur={10}
            />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8 space-y-4"
            >
              {/* Category / Tag Switcher */}
              <div className="flex items-center justify-between">
                <FilterModeTabs mode={filterMode} onSwitch={handleModeSwitch} />
              </div>

              {/* Desktop Filter Pills */}
              {filterMode === "category" ? (
                <DesktopFilterBar
                  items={categories}
                  activeSlug={activeCategorySlug}
                  onSelect={handleCategorySelect}
                />
              ) : (
                <DesktopFilterBar
                  items={tags}
                  activeSlug={activeTagSlug}
                  onSelect={handleTagSelect}
                />
              )}

              {/* Mobile Filter Dropdown */}
              {filterMode === "category" ? (
                <MobileDropdown
                  items={categories}
                  activeSlug={activeCategorySlug}
                  placeholder="All categories"
                  onSelect={handleCategorySelect}
                />
              ) : (
                <MobileDropdown
                  items={tags}
                  activeSlug={activeTagSlug}
                  placeholder="All tags"
                  onSelect={handleTagSelect}
                />
              )}

              <div className="flex items-center gap-3 min-h-[24px]">
                <AnimatePresence>
                  {activeFilterLabel && (
                    <ActiveFilterBadge
                      label={activeFilterLabel}
                      onClear={() => {
                        if (activeCategorySlug) handleCategorySelect(null);
                        else handleTagSelect(null);
                      }}
                    />
                  )}
                </AnimatePresence>
                <ResultsCount
                  total={totalItems}
                  loading={loading}
                  filterLabel={activeFilterLabel}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════ GRID ═══════════════ */}
        <section className="section-container pt-2 pb-28 relative z-10">
          <div className="max-w-[1100px] mx-auto px-4 md:px-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={gridKey}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-4"
              >
                {loading ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {Array.from({ length: PER_PAGE }).map((_, i) => (
                      <SkeletonCard key={i} index={i} />
                    ))}
                  </div>
                ) : projects.length === 0 && (activeCategorySlug || activeTagSlug) ? (
                  <div className="grid grid-cols-1 gap-4">
                    <EmptyState
                      filterLabel={activeFilterLabel ?? "selected filter"}
                      onClear={() => {
                        if (activeCategorySlug) handleCategorySelect(null);
                        else handleTagSelect(null);
                      }}
                    />
                  </div>
                ) : (
                  projectRows.map((pair, rowIdx) => (
                    <ProjectCardRow
                      key={rowIdx}
                      pair={pair}
                      rowIndex={rowIdx}
                      onCategoryClick={handleCategorySelect}
                      onTagClick={handleTagSelect}
                    />
                  ))
                )}
              </motion.div>
            </AnimatePresence>

            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        </section>
      </div>

      <CTAFooter />
    </div>
  );
};

export default ProjectDisplay;