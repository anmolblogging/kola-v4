import { useState, useEffect, useCallback, useRef, memo } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useNavigate, useParams, useLocation, Link } from "react-router-dom";
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

export interface PostTaxonomyItem {
  id?: number;
  name: string;
  slug: string;
  taxonomy?: string;
}

interface AioseoSchema {
  "@graph"?: Array<{
    "@type": string;
    articleSection?: string;
    image?: { url: string };
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content?: { rendered: string };
  date: string;
  featured_media: number;
  categories: number[];
  tags?: number[];
  aioseo_head_json?: {
    title?: string;
    description?: string;
    schema?: AioseoSchema;
    [key: string]: unknown;
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string; alt_text?: string }>;
    "wp:term"?: Array<Array<{ id: number; name: string; slug: string; taxonomy: string }>>;
  };
}

interface NormalizedPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  formattedDate: string;
  img: string;
  imgAlt: string;
  categories: PostTaxonomyItem[];
  tags: PostTaxonomyItem[];
  allTerms: PostTaxonomyItem[];
  articleTags: string[];
}

interface FetchState {
  posts: NormalizedPost[];
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

const stripHtml = (html: string) =>
  html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const formatDate = (iso: string): string => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short", day: "numeric", year: "numeric",
    }).format(new Date(iso));
  } catch { return iso; }
};

const getSchemaImageUrl = (schema?: AioseoSchema): string => {
  if (!schema?.["@graph"]) return "";
  for (const node of schema["@graph"]) {
    if (
      (node["@type"] === "NewsArticle" || node["@type"] === "Article") &&
      node.image &&
      typeof (node.image as { url?: string }).url === "string"
    ) return (node.image as { url: string }).url;
  }
  return "";
};

const getArticleTagsFromSchema = (schema?: AioseoSchema): string[] => {
  if (!schema?.["@graph"]) return [];
  const article = schema["@graph"].find(
    (n) => n["@type"] === "NewsArticle" || n["@type"] === "Article"
  );
  if (!article?.articleSection) return [];
  return (article.articleSection as string)
    .split(",")
    .map((t) => decodeHtmlEntities(t.trim()))
    .filter(Boolean);
};

const normalizePost = (p: WPPost): NormalizedPost => {
  if (p.slug) {
    setCachedSlugType(p.slug, "blog");
  }
  const img =
    p._embedded?.["wp:featuredmedia"]?.[0]?.source_url ??
    getSchemaImageUrl(p.aioseo_head_json?.schema) ??
    "/placeholder.jpg";
  const imgAlt =
    p._embedded?.["wp:featuredmedia"]?.[0]?.alt_text ??
    decodeHtmlEntities(p.title.rendered);

  const categories: PostTaxonomyItem[] = [];
  const tags: PostTaxonomyItem[] = [];
  const seenSlugs = new Set<string>();

  if (Array.isArray(p._embedded?.["wp:term"])) {
    p._embedded["wp:term"].forEach((group) => {
      if (Array.isArray(group)) {
        group.forEach((term) => {
          if (term?.name) {
            const decodedName = decodeHtmlEntities(term.name);
            const slug = term.slug || decodedName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            const item: PostTaxonomyItem = {
              id: term.id,
              name: decodedName,
              slug,
              taxonomy: term.taxonomy,
            };
            if (term.taxonomy === "category") {
              categories.push(item);
            } else if (term.taxonomy === "post_tag") {
              tags.push(item);
            } else {
              tags.push(item);
            }
          }
        });
      }
    });
  }

  const articleTags = getArticleTagsFromSchema(p.aioseo_head_json?.schema);
  if (tags.length === 0 && articleTags.length > 0) {
    articleTags.forEach((t) => {
      const decoded = decodeHtmlEntities(t);
      tags.push({
        name: decoded,
        slug: decoded.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        taxonomy: "post_tag",
      });
    });
  }

  const allTerms: PostTaxonomyItem[] = [];
  [...categories, ...tags].forEach((t) => {
    if (!seenSlugs.has(t.slug)) {
      seenSlugs.add(t.slug);
      allTerms.push(t);
    }
  });

  const excerpt = decodeHtmlEntities(stripHtml(p.excerpt.rendered));

  return {
    id: p.id,
    slug: p.slug,
    title: decodeHtmlEntities(p.title.rendered),
    excerpt,
    date: p.date,
    formattedDate: formatDate(p.date),
    img,
    imgAlt,
    categories,
    tags,
    allTerms,
    articleTags,
  };
};

/* ══════════════════════════════════════════
   HOOKS
══════════════════════════════════════════ */

const useCategories = () => {
  const [categories, setCategories] = useState<WPTaxonomyItem[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetch(`${WP_API_BASE}/categories?per_page=100&hide_empty=true`)
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

const useTags = () => {
  const [tags, setTags] = useState<WPTaxonomyItem[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetch(`${WP_API_BASE}/tags?per_page=100&hide_empty=true`)
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

const usePosts = (
  page: number,
  categoryId: number | null,
  categorySlug: string | null,
  tagId: number | null,
  tagSlug: string | null
): FetchState => {
  const [state, setState] = useState<FetchState>(() => {
    if (
      typeof window !== "undefined" &&
      (window as any).__INITIAL_DATA__?.blogs &&
      page === 1 &&
      !categoryId &&
      !tagId &&
      !categorySlug &&
      !tagSlug
    ) {
      return {
        posts: (window as any).__INITIAL_DATA__.blogs.posts,
        loading: false,
        totalPages: (window as any).__INITIAL_DATA__.blogs.totalPages,
        totalItems: (window as any).__INITIAL_DATA__.blogs.totalItems,
      };
    }
    return { posts: [], loading: true, totalPages: 1, totalItems: 0 };
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));

    if (categoryId) {
      fetch(`${WP_API_BASE}/posts?per_page=${PER_PAGE}&page=${page}&categories=${categoryId}&_embed=1&orderby=date&order=desc`)
        .then(async (r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const totalPages = Number(r.headers.get("X-WP-TotalPages") ?? 1);
          const totalItems = Number(r.headers.get("X-WP-Total") ?? 0);
          const data: WPPost[] = await r.json();
          if (!cancelled)
            setState({ posts: data.map(normalizePost), loading: false, totalPages, totalItems });
        })
        .catch(() => { if (!cancelled) setState((s) => ({ ...s, loading: false })); });
    } else if (tagId) {
      fetch(`${WP_API_BASE}/posts?per_page=${PER_PAGE}&page=${page}&tags=${tagId}&_embed=1&orderby=date&order=desc`)
        .then(async (r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const totalPages = Number(r.headers.get("X-WP-TotalPages") ?? 1);
          const totalItems = Number(r.headers.get("X-WP-Total") ?? 0);
          const data: WPPost[] = await r.json();
          if (!cancelled)
            setState({ posts: data.map(normalizePost), loading: false, totalPages, totalItems });
        })
        .catch(() => { if (!cancelled) setState((s) => ({ ...s, loading: false })); });
    } else if (categorySlug || tagSlug) {
      fetch(`${WP_API_BASE}/posts?per_page=100&_embed=1&orderby=date&order=desc`)
        .then(async (r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const data: WPPost[] = await r.json();
          if (cancelled) return;
          const normalized = data.map(normalizePost);
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
                p.articleTags.some((t) => t.toLowerCase() === tagSlug.toLowerCase())
              );
            }
            return true;
          });
          const totalItems = filtered.length;
          const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));
          const safePage = Math.min(page, totalPages);
          const start = (safePage - 1) * PER_PAGE;
          setState({
            posts: filtered.slice(start, start + PER_PAGE),
            loading: false,
            totalPages,
            totalItems,
          });
        })
        .catch(() => { if (!cancelled) setState((s) => ({ ...s, loading: false })); });
    } else {
      fetch(`${WP_API_BASE}/posts?per_page=${PER_PAGE}&page=${page}&_embed=1&orderby=date&order=desc`)
        .then(async (r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const totalPages = Number(r.headers.get("X-WP-TotalPages") ?? 1);
          const totalItems = Number(r.headers.get("X-WP-Total") ?? 0);
          const data: WPPost[] = await r.json();
          if (!cancelled)
            setState({ posts: data.map(normalizePost), loading: false, totalPages, totalItems });
        })
        .catch(() => { if (!cancelled) setState((s) => ({ ...s, loading: false })); });
    }

    return () => { cancelled = true; };
  }, [page, categoryId, categorySlug, tagId, tagSlug]);

  return state;
};

/* ══════════════════════════════════════════
   BLOG CARD
══════════════════════════════════════════ */

interface BlogCardProps {
  post: NormalizedPost;
  index: number;
  onCategoryClick: (item: PostTaxonomyItem) => void;
  onTagClick: (item: PostTaxonomyItem) => void;
}

const BlogCard = memo(({ post, index, onCategoryClick }: BlogCardProps) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div className="h-full block">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: index * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group overflow-hidden rounded-xl border border-black/10 bg-white h-full flex flex-col transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] hover:border-black/20"
      >
        {/* Image */}
        <Link to={`/${post.slug}`} className="relative overflow-hidden aspect-[16/10] bg-black/[0.03] block">
          <motion.img
            src={post.img}
            alt={post.imgAlt}
            className="w-full h-full object-cover"
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            loading="lazy"
          />
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 shadow-sm">
            <ArrowUpRight size={13} className="text-black" />
          </div>
        </Link>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1 justify-between">
          <div>
            {post.categories.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mb-3">
                {post.categories.map((cat) => (
                  <button key={`cat-${cat.slug || cat.name}`}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onCategoryClick(cat);
                    }}
                    className="text-[10.5px] px-2.5 py-0.5 rounded-full border border-black/10 text-black/45 tracking-wide bg-black/[0.02] hover:border-black/30 hover:text-black transition-colors cursor-pointer"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
            <Link to={`/${post.slug}`} className="block">
              <h3 className={`text-[17px] font-semibold leading-snug tracking-[-0.02em] mb-2.5 transition-colors duration-200 line-clamp-2 ${hovered ? "text-black/65" : "text-black"}`}>
                {post.title}
              </h3>
            </Link>
            {post.excerpt && (
              <p className="text-[13px] text-black/50 leading-relaxed line-clamp-2 mb-4">
                {post.excerpt}
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-black/[0.06] text-[11.5px] text-black/35 mt-auto">
            <span>{post.formattedDate}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

interface BlogCardRowProps {
  pair: NormalizedPost[];
  rowIndex: number;
  onCategoryClick: (item: PostTaxonomyItem) => void;
}

const BlogCardRow = memo(({ pair, rowIndex, onCategoryClick }: BlogCardRowProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {pair.map((post, i) => (
      <BlogCard key={post.slug} post={post} index={rowIndex * 2 + i}
        onCategoryClick={onCategoryClick}
      />
    ))}
  </div>
));

const SkeletonCard = memo(({ index }: { index: number }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    transition={{ delay: index * 0.05, duration: 0.3 }}
    className="border border-black/10 rounded-xl overflow-hidden bg-white flex flex-col">
    <div className="p-5 border-b border-black/10 space-y-2">
      <div className="h-4 bg-black/[0.06] rounded-sm w-3/4 animate-pulse" />
      <div className="flex gap-2">
        <div className="h-3.5 bg-black/[0.04] rounded-sm w-16 animate-pulse" />
        <div className="h-3.5 bg-black/[0.04] rounded-sm w-12 animate-pulse" />
      </div>
    </div>
    <div className="aspect-[16/9] bg-black/[0.04] animate-pulse" />
    <div className="p-3 border-t border-black/10 flex justify-between">
      <div className="h-3 bg-black/[0.04] rounded-sm w-16 animate-pulse" />
      <div className="h-3 bg-black/[0.04] rounded-sm w-16 animate-pulse" />
    </div>
  </motion.div>
));

/* ══════════════════════════════════════════
   FILTER TABS & BARS
══════════════════════════════════════════ */

type FilterMode = "category" | "tag";

const FilterModeTabs = memo(({ mode, onSwitch }: { mode: FilterMode; onSwitch: (m: FilterMode) => void }) => (
  <div className="flex gap-1 p-1 bg-black/[0.04] rounded-full w-fit">
    {(["category", "tag"] as FilterMode[]).map((m) => (
      <motion.button key={m}
        onClick={() => onSwitch(m)}
        whileTap={{ scale: 0.96 }}
        className={`px-4 py-1.5 text-[12px] font-medium rounded-full transition-all duration-200 capitalize ${
          mode === m ? "bg-white text-black shadow-sm" : "text-black/45 hover:text-black"
        }`}>
        {m === "category" ? "Categories" : "Tags"}
      </motion.button>
    ))}
  </div>
));

interface TaxonomyFilterBarProps {
  items: WPTaxonomyItem[];
  activeId: number | null;
  activeSlug: string | null;
  onSelect: (item: WPTaxonomyItem | null) => void;
}

const DesktopFilterBar = memo(({ items, activeId, activeSlug, onSelect }: TaxonomyFilterBarProps) => {
  if (!items.length) return null;
  return (
    <div className="hidden md:flex flex-wrap gap-2">
      <motion.button onClick={() => onSelect(null)} whileTap={{ scale: 0.95 }}
        className={`px-4 py-1.5 text-[12px] font-medium border rounded-full transition-all duration-200 whitespace-nowrap ${(!activeId && !activeSlug) ? "bg-black text-white border-black" : "text-black/50 border-black/[0.12] hover:border-black/30 hover:text-black"}`}>
        All
      </motion.button>
      {items.map((item) => {
        const isActive = (activeId && item.id === activeId) || (activeSlug && item.slug.toLowerCase() === activeSlug.toLowerCase());
        return (
          <motion.button key={item.id}
            onClick={() => onSelect(isActive ? null : item)}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-1.5 text-[12px] font-medium border rounded-full transition-all duration-200 whitespace-nowrap ${isActive ? "bg-black text-white border-black" : "text-black/50 border-black/[0.12] hover:border-black/30 hover:text-black"}`}>
            {item.name}
          </motion.button>
        );
      })}
    </div>
  );
});

interface MobileDropdownProps {
  items: WPTaxonomyItem[];
  activeId: number | null;
  activeSlug: string | null;
  placeholder: string;
  onSelect: (item: WPTaxonomyItem | null) => void;
}

const MobileDropdown = memo(({ items, activeId, activeSlug, placeholder, onSelect }: MobileDropdownProps) => {
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
    return () => { window.removeEventListener("scroll", syncRect, true); window.removeEventListener("resize", syncRect); };
  }, [open, syncRect]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      const panel = document.getElementById("bd-mobile-panel");
      if (!triggerRef.current?.contains(t) && !panel?.contains(t)) setOpen(false);
    };
    const timer = setTimeout(() => document.addEventListener("mousedown", handler), 10);
    return () => { clearTimeout(timer); document.removeEventListener("mousedown", handler); };
  }, [open]);

  const activeItem = items.find((i) => (activeId && i.id === activeId) || (activeSlug && i.slug.toLowerCase() === activeSlug.toLowerCase()));

  const panel =
    open && triggerRect
      ? createPortal(
          <AnimatePresence>
            <motion.div
              id="bd-mobile-panel"
              key="bd-panel"
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
                  !activeItem
                    ? "text-black font-semibold bg-black/[0.04]"
                    : "text-black/55 hover:bg-black/[0.02] hover:text-black"
                }`}
              >
                <span>{placeholder}</span>
                {!activeItem && <span className="w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />}
              </button>

              {items.map((item, i) => {
                const isSelected = activeItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onSelect(isSelected ? null : item); setOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 text-[13px] transition-colors duration-100 ${
                      i < items.length - 1 ? "border-b border-black/[0.05]" : ""
                    } ${
                      isSelected
                        ? "text-black font-semibold bg-black/[0.04]"
                        : "text-black/55 hover:bg-black/[0.02] hover:text-black"
                    }`}
                  >
                    <span>{item.name}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />}
                  </button>
                );
              })}
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
        <span className={activeItem ? "text-black font-medium" : "text-black/45"}>
          {activeItem?.name ?? placeholder}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {activeItem && (
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(null); setOpen(false); }}
              className="text-black/30 hover:text-black/60 transition-colors p-0.5"
              aria-label="Clear filter"
            >
              <X size={12} strokeWidth={2} />
            </button>
          )}
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} className="text-black/40" />
          </motion.span>
        </div>
      </motion.button>
      {panel}
    </div>
  );
});

const ActiveFilterBadge = memo(({ name, onClear }: { name: string; onClear: () => void }) => (
  <motion.div initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, y: -4 }} transition={{ duration: 0.2 }}
    className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[11.5px] rounded-full font-medium">
    <span>{name}</span>
    <button onClick={onClear} className="hover:opacity-70 transition-opacity" aria-label="Remove filter">
      <X size={10} strokeWidth={2} />
    </button>
  </motion.div>
));

const ResultsCount = memo(({ total, loading, label }: {
  total: number; loading: boolean; label: string | null;
}) => {
  if (loading) return null;
  return (
    <motion.p key={`${total}-${label}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="text-[11.5px] text-black/30 tracking-wide">
      {total} {total === 1 ? "article" : "articles"}
      {label ? ` in "${label}"` : ""}
    </motion.p>
  );
});

const PaginationBtn = memo(({ onClick, disabled, active, children }: {
  onClick: () => void; disabled?: boolean; active?: boolean; children: React.ReactNode;
}) => (
  <motion.button onClick={onClick} disabled={disabled} whileTap={!disabled ? { scale: 0.9 } : {}}
    className={`inline-flex items-center justify-center w-9 h-9 text-sm border transition-colors duration-150 ${
      active ? "border-black bg-black text-white" : "border-black/10 text-black/60 hover:border-black/30 hover:text-black"
    } disabled:opacity-30 disabled:cursor-not-allowed`}>
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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }} className="mt-16 flex items-center justify-center gap-2">
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

const EmptyState = memo(({ label, onClear }: { label: string; onClear: () => void }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
    className="col-span-full py-24 flex flex-col items-center justify-center gap-4">
    <p className="text-black/30 text-sm tracking-wide">No articles in <span className="text-black/60 font-medium">"{label}"</span></p>
    <button onClick={onClear} className="flex items-center gap-1.5 text-xs text-black/40 hover:text-black transition-colors"><X size={12} /> Clear filter</button>
  </motion.div>
));

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */

const BlogDisplay = () => {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isCategoryRoute = location.pathname.startsWith("/category");
  const isTagRoute = location.pathname.startsWith("/tag");

  const categoryParam = searchParams.get("category");
  const tagParam = searchParams.get("tag");
  const pageParam = Math.max(1, Number(searchParams.get("page") ?? 1));

  const categories = useCategories();
  const tags = useTags();

  const [filterMode, setFilterMode] = useState<FilterMode>(() =>
    isTagRoute || tagParam ? "tag" : "category"
  );

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(categoryParam);
  const [activeTagId, setActiveTagId] = useState<number | null>(null);
  const [activeTagSlug, setActiveTagSlug] = useState<string | null>(tagParam);
  const [page, setPage] = useState(pageParam);

  useEffect(() => {
    if (isCategoryRoute && routeSlug) {
      setFilterMode("category");
      setActiveCategorySlug(routeSlug);
      setActiveTagSlug(null);
      setActiveTagId(null);
      const found = categories.find((c) => c.slug.toLowerCase() === routeSlug.toLowerCase());
      if (found) {
        setActiveCategoryId(found.id);
      } else {
        fetch(`${WP_API_BASE}/categories?slug=${encodeURIComponent(routeSlug)}`)
          .then((r) => r.json() as Promise<WPTaxonomyItem[]>)
          .then((data) => {
            if (data && data.length > 0) setActiveCategoryId(data[0].id);
          })
          .catch(() => {});
      }
    } else if (isTagRoute && routeSlug) {
      setFilterMode("tag");
      setActiveTagSlug(routeSlug);
      setActiveCategorySlug(null);
      setActiveCategoryId(null);
      const found = tags.find((t) => t.slug.toLowerCase() === routeSlug.toLowerCase());
      if (found) {
        setActiveTagId(found.id);
      } else {
        fetch(`${WP_API_BASE}/tags?slug=${encodeURIComponent(routeSlug)}`)
          .then((r) => r.json() as Promise<WPTaxonomyItem[]>)
          .then((data) => {
            if (data && data.length > 0) setActiveTagId(data[0].id);
          })
          .catch(() => {});
      }
    } else {
      if (categoryParam) {
        setFilterMode("category");
        setActiveCategorySlug(categoryParam);
        setActiveTagSlug(null);
        setActiveTagId(null);
        const found = categories.find((c) => c.slug.toLowerCase() === categoryParam.toLowerCase() || String(c.id) === categoryParam);
        setActiveCategoryId(found ? found.id : null);
      } else if (tagParam) {
        setFilterMode("tag");
        setActiveTagSlug(tagParam);
        setActiveCategorySlug(null);
        setActiveCategoryId(null);
        const found = tags.find((t) => t.slug.toLowerCase() === tagParam.toLowerCase() || String(t.id) === tagParam);
        setActiveTagId(found ? found.id : null);
      } else {
        setActiveCategoryId(null);
        setActiveCategorySlug(null);
        setActiveTagId(null);
        setActiveTagSlug(null);
      }
    }
    setPage(pageParam);
  }, [isCategoryRoute, isTagRoute, routeSlug, categories, tags, categoryParam, tagParam, pageParam]);

  const { posts, loading, totalPages, totalItems } = usePosts(
    page,
    filterMode === "category" ? activeCategoryId : null,
    filterMode === "category" ? activeCategorySlug : null,
    filterMode === "tag" ? activeTagId : null,
    filterMode === "tag" ? activeTagSlug : null
  );

  const scrollToTop = useCallback(() => {
    setTimeout(() => document.getElementById("blog-display")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }, []);

  const handleCategorySelect = useCallback((item: WPTaxonomyItem | null) => {
    if (item) {
      setActiveCategoryId(item.id);
      setActiveCategorySlug(item.slug);
      setPage(1);
      navigate(`/category/${item.slug}`);
    } else {
      setActiveCategoryId(null);
      setActiveCategorySlug(null);
      setPage(1);
      navigate("/blogs");
    }
    scrollToTop();
  }, [navigate, scrollToTop]);

  const handleTagSelect = useCallback((item: WPTaxonomyItem | null) => {
    if (item) {
      setActiveTagId(item.id);
      setActiveTagSlug(item.slug);
      setPage(1);
      navigate(`/tag/${item.slug}`);
    } else {
      setActiveTagId(null);
      setActiveTagSlug(null);
      setPage(1);
      navigate("/blogs");
    }
    scrollToTop();
  }, [navigate, scrollToTop]);

  const handleCardCategoryClick = useCallback((item: PostTaxonomyItem) => {
    setFilterMode("category");
    const matched = categories.find((c) => (item.id && c.id === item.id) || c.slug === item.slug);
    if (matched) {
      handleCategorySelect(matched);
    } else {
      navigate(`/category/${item.slug}`);
    }
  }, [categories, handleCategorySelect, navigate]);

  const handleCardTagClick = useCallback((item: PostTaxonomyItem) => {
    setFilterMode("tag");
    const matched = tags.find((t) => (item.id && t.id === item.id) || t.slug === item.slug);
    if (matched) {
      handleTagSelect(matched);
    } else {
      navigate(`/tag/${item.slug}`);
    }
  }, [tags, handleTagSelect, navigate]);

  const handleFilterModeSwitch = useCallback((m: FilterMode) => {
    setFilterMode(m);
    setActiveCategoryId(null);
    setActiveCategorySlug(null);
    setActiveTagId(null);
    setActiveTagSlug(null);
    setPage(1);
    navigate("/blogs");
    scrollToTop();
  }, [navigate, scrollToTop]);

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
    const search = p > 1 ? `?page=${p}` : "";
    navigate(`${location.pathname}${search}`, { replace: true });
    scrollToTop();
  }, [location.pathname, navigate, scrollToTop]);

  const activeFilterLabel =
    filterMode === "category"
      ? (categories.find((c) => (activeCategoryId && c.id === activeCategoryId) || (activeCategorySlug && c.slug === activeCategorySlug))?.name ?? activeCategorySlug)
      : (tags.find((t) => (activeTagId && t.id === activeTagId) || (activeTagSlug && t.slug === activeTagSlug))?.name ?? activeTagSlug);

  const gridKey = `${filterMode}-${activeCategoryId ?? activeCategorySlug ?? "all"}-${activeTagId ?? activeTagSlug ?? "all"}-${page}`;

  const postRows = Array.from(
    { length: Math.ceil(posts.length / 2) },
    (_, i) => posts.slice(i * 2, i * 2 + 2)
  );

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Digital Marketing Insights | Kola Communications Blog</title>
        <meta name="description" content="Kola Communications blog covers website development, SEO, AEO, WordPress, Shopify, social media, content writing and AI tools for businesses growing online." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.kolacommunications.com/blogs" />
      </Helmet>
      <CustomCursor />
      <div className="relative overflow-hidden">
        <ColumnGuides />

        {/* ═══════ HEADER ═══════ */}
        <section id="blog-display" className="section-container pt-28 pb-0 relative z-10">
          <div className="max-w-[1100px] mx-auto px-4 md:px-10">
            <motion.button onClick={() => navigate(-1)}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mb-10 flex items-center gap-2 text-sm text-black/35 hover:text-black transition-colors">
              <ChevronLeft size={14} /> Back
            </motion.button>

            <AnimatedHeading lines={["Articles &", "design insights."]}
              className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.05] tracking-[-0.02em] max-w-[640px] mb-10 md:mt-4"
              stagger={0.07} duration={0.7} blur={10} />

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8 space-y-4">

              <div className="flex items-center justify-between">
                <FilterModeTabs mode={filterMode} onSwitch={handleFilterModeSwitch} />
              </div>

              {/* Desktop filter bar */}
              {filterMode === "category" ? (
                <DesktopFilterBar
                  items={categories}
                  activeId={activeCategoryId}
                  activeSlug={activeCategorySlug}
                  onSelect={handleCategorySelect}
                />
              ) : (
                <DesktopFilterBar
                  items={tags}
                  activeId={activeTagId}
                  activeSlug={activeTagSlug}
                  onSelect={handleTagSelect}
                />
              )}

              {/* Mobile dropdown */}
              {filterMode === "category" ? (
                <MobileDropdown
                  items={categories}
                  activeId={activeCategoryId}
                  activeSlug={activeCategorySlug}
                  placeholder="All categories"
                  onSelect={handleCategorySelect}
                />
              ) : (
                <MobileDropdown
                  items={tags}
                  activeId={activeTagId}
                  activeSlug={activeTagSlug}
                  placeholder="All tags"
                  onSelect={handleTagSelect}
                />
              )}

              {/* Active badge + count */}
              <div className="flex items-center gap-3 min-h-[24px]">
                <AnimatePresence>
                  {activeFilterLabel && (
                    <ActiveFilterBadge
                      name={activeFilterLabel}
                      onClear={() => filterMode === "tag" ? handleTagSelect(null) : handleCategorySelect(null)}
                    />
                  )}
                </AnimatePresence>
                <ResultsCount total={totalItems} loading={loading} label={activeFilterLabel} />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════ GRID ═══════ */}
        <section className="section-container pt-2 pb-28 relative z-10">
          <div className="max-w-[1100px] mx-auto px-4 md:px-10">
            <AnimatePresence mode="wait">
              <motion.div key={gridKey}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
                className="flex flex-col gap-4">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: PER_PAGE }).map((_, i) => <SkeletonCard key={i} index={i} />)}
                  </div>
                ) : posts.length === 0 && activeFilterLabel ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EmptyState label={activeFilterLabel} onClear={() => filterMode === "tag" ? handleTagSelect(null) : handleCategorySelect(null)} />
                  </div>
                ) : (
                  postRows.map((pair, rowIdx) => (
                    <BlogCardRow key={rowIdx} pair={pair} rowIndex={rowIdx}
                      onCategoryClick={handleCardCategoryClick}
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

export default BlogDisplay;