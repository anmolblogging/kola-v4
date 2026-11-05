import { useEffect, useMemo, useState, memo } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowLeft, Check, Plus, Minus, Image as ImageIcon } from "lucide-react";
import LegacyProjectPage from "./ProjectsPage";
import NotFound from "./NotFound";
import Loading from "@/components/Projectpageloader";
import ContactForm from "@/components/ContactForm";
import CTAFooter from "@/components/CTAFooter";
import ColumnGuides from "@/components/ColumnGuides";

/* ══════════════════════════════════════════
   Project case-study page, driven by the ACF "Projects" field group.
   Projects not yet filled in with the new fields fall back to the old page.
══════════════════════════════════════════ */

const WP_API = "https://cms.kolacommunications.com/wp-json/wp/v2";
const SITE = "https://kolacommunications.com";

type AcfImage = { url: string; alt?: string; width?: number; height?: number } | false | null | number;

interface ProjectAcf {
  project_name?: string;
  tagline?: string;
  website_url?: string;
  about_client?: string;
  industry?: string;
  location?: string;
  platform?: string;
  year?: string;
  brief?: string;
  approach_heading?: string;
  approach?: string;
  deliverables?: string;
  results?: string;
  hero_image?: AcfImage;
  gallery_image_1?: AcfImage;
  gallery_image_2?: AcfImage;
  gallery_image_3?: AcfImage;
  gallery_image_4?: AcfImage;
  [key: string]: unknown;
}

interface WPProject {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  acf?: ProjectAcf;
  aioseo_head_json?: { title?: string; description?: string; [k: string]: unknown };
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string; alt_text?: string }>;
    "wp:term"?: Array<Array<{ id: number; name: string; slug: string; taxonomy: string }>>;
  };
}

/* ─── helpers ─── */
const decode = (s = "") => {
  if (typeof document === "undefined") return s;
  const t = document.createElement("textarea");
  t.innerHTML = s;
  return t.value;
};
const lines = (s?: string) => (s ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const hasNewFields = (p: WPProject) => Boolean(p.acf?.brief || p.acf?.approach);
const imgUrl = (i?: AcfImage) => (i && typeof i === "object" ? i.url : "");
const host = (url?: string) => {
  try { return url ? new URL(url).hostname.replace(/^www\./, "") : ""; } catch { return ""; }
};
const fetchProject = (slug: string) =>
  fetch(`${WP_API}/project?slug=${encodeURIComponent(slug)}&_embed=1&acf_format=standard`)
    .then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json() as Promise<WPProject[]>; })
    .then((d) => d[0] ?? null);

/* Same order as the services list on the homepage and /services */
const SERVICE_ORDER = [
  "website-development", "seo-aeo-geo", "ai-automation", "mobile-app-development", "performance-marketing",
  "lead-generation-conversion", "social-media-marketing", "content-creation-strategy", "brand-identity-design",
];
// Tech-stack tags first (what the site is built on), then everything else
const TECH_TAGS = ["wordpress", "woocommerce", "shopify", "custom-theme", "elementor", "next-js", "nuxt-js", "react-js", "node-js", "tailwind-css", "headless-cms", "custom-coded"];
const tagRank = (slug: string) => { const i = TECH_TAGS.indexOf(slug); return i === -1 ? 99 : i; };
const serviceRank = (slug: string) => { const i = SERVICE_ORDER.indexOf(slug); return i === -1 ? 99 : i; };

/* Show grey placeholders where images will go while projects have none.
   Set to false (or add the images in WordPress) before launch. */
const SHOW_IMAGE_PLACEHOLDERS = false;

const ImagePlaceholder = ({ label, size, className = "" }: { label: string; size: string; className?: string }) => (
  <div className={`flex flex-col items-center justify-center gap-2 bg-[repeating-linear-gradient(135deg,#f4f4f4_0_12px,#efefef_12px_24px)] text-black/35 ${className}`}>
    <ImageIcon size={26} strokeWidth={1.5} />
    <p className="text-[13px] font-medium text-black/45">{label}</p>
    <p className="text-[11px]">{size}</p>
  </div>
);

/* Static class names so Tailwind keeps them */
const LG_COLS: Record<number, string> = { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" };

/* ─── small UI pieces ─── */
const SectionRow = ({ label, children, id }: { label: string; children: React.ReactNode; id?: string }) => (
  <section id={id} className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 lg:gap-16 py-10 md:py-14 border-t border-border">
    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground lg:pt-2">{label}</p>
    <div className="min-w-0">{children}</div>
  </section>
);

const Prose = ({ html }: { html: string }) => (
  <div
    className="max-w-[760px] text-[16px] md:text-[17px] leading-[1.75] text-black/70 space-y-5 [&_strong]:text-black [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_h3]:text-black [&_h3]:font-semibold"
    dangerouslySetInnerHTML={{ __html: html }}
  />
);

const Faq = memo(({ items }: { items: { q: string; a: string }[] }) => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="max-w-[820px] border-t border-border">
      {items.map((f, i) => {
        const on = open === i;
        return (
          <div key={f.q} className="border-b border-border">
            <button
              type="button"
              aria-expanded={on}
              onClick={() => setOpen(on ? null : i)}
              className="w-full flex items-start justify-between gap-6 py-5 text-left"
            >
              <h3 className="text-[16px] md:text-[17px] font-medium leading-snug">{f.q}</h3>
              <span className="shrink-0 w-7 h-7 border border-black/15 flex items-center justify-center mt-0.5">
                {on ? <Minus size={14} /> : <Plus size={14} />}
              </span>
            </button>
            {/* Always in the DOM so search engines and AI tools can read it */}
            <motion.div
              initial={false}
              animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <p className="pb-6 pr-12 text-[15px] leading-[1.7] text-black/65">{f.a}</p>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
});

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
const CaseStudy = ({ project }: { project: WPProject }) => {
  const a = project.acf ?? {};
  const [contactOpen, setContactOpen] = useState(false);
  const [more, setMore] = useState<WPProject[]>([]);

  const name = a.project_name || decode(project.title.rendered);
  const terms = project._embedded?.["wp:term"]?.flat() ?? [];
  const services = terms
    .filter((t) => t.taxonomy === "project-category")
    .sort((x, y) => serviceRank(x.slug) - serviceRank(y.slug))
    .map((t) => decode(t.name));
  const heroImg = imgUrl(a.hero_image) || project._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";
  const tags = terms
    .filter((t) => t.taxonomy === "project-tag")
    .sort((x, y) => tagRank(x.slug) - tagRank(y.slug))
    .map((t) => ({ slug: t.slug, name: decode(t.name) }));
  const deliverables = lines(a.deliverables);
  const results = lines(a.results);
  const faqs = [1, 2, 3, 4, 5]
    .map((n) => ({ q: String(a[`faq_${n}_question`] ?? "").trim(), a: String(a[`faq_${n}_answer`] ?? "").trim() }))
    .filter((f) => f.q && f.a);
  const overview = project.content?.rendered?.trim();
  const site = host(a.website_url);

  const details = [
    { label: "Industry", value: a.industry },
    { label: "Platform", value: a.platform },
    { label: "Services", value: services.join(", ") },
    { label: "Location", value: a.location },
  ].filter((d) => d.value);
  if (a.year && details.length < 4) details.push({ label: "Year", value: a.year });

  const seoTitle = project.aioseo_head_json?.title || `${name} | Case study | Kola Communications`;
  const seoDesc = project.aioseo_head_json?.description || a.tagline || "";
  const canonical = `${SITE}/project/${project.slug}`;

  useEffect(() => {
    let cancelled = false;
    fetch(`${WP_API}/project?per_page=4&exclude=${project.id}&_embed=1&_fields=id,slug,title,acf.project_name,acf.industry,acf.tagline,_links,_embedded`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && Array.isArray(d)) setMore(d.slice(0, 3)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [project.id]);

  const jsonLd = useMemo(() => {
    const graph: object[] = [
      {
        "@type": "CreativeWork",
        name: `${name} case study`,
        headline: a.tagline || name,
        url: canonical,
        about: a.about_client || undefined,
        creator: { "@type": "Organization", name: "Kola Communications", url: SITE },
        ...(a.website_url ? { mentions: { "@type": "Organization", name, url: a.website_url } } : {}),
        ...(heroImg ? { image: heroImg } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE}/projects` },
          { "@type": "ListItem", position: 3, name, item: canonical },
        ],
      },
    ];
    if (faqs.length)
      graph.push({
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      });
    return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
  }, [name, a.tagline, a.about_client, a.website_url, canonical, heroImg, faqs]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{decode(seoTitle)}</title>
        {seoDesc && <meta name="description" content={decode(seoDesc)} />}
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={decode(seoTitle)} />
        {seoDesc && <meta property="og:description" content={decode(seoDesc)} />}
        <meta property="og:url" content={canonical} />
        {heroImg && <meta property="og:image" content={heroImg} />}
        <script type="application/ld+json">{jsonLd}</script>
      </Helmet>
      <ContactForm open={contactOpen} onClose={() => setContactOpen(false)} />

      <div className="relative overflow-hidden">
        <ColumnGuides />

        <article className="section-container px-4 sm:px-6 md:px-8 lg:px-10 pt-28 md:pt-36 lg:pt-40">
          {/* ═══ HERO: title left, image right ═══ */}
          <header className={`grid grid-cols-1 ${heroImg || SHOW_IMAGE_PLACEHOLDERS ? "lg:grid-cols-[1.05fr_0.95fr]" : ""} gap-10 lg:gap-14 items-center pb-10 md:pb-14`}>
            <div>
              <nav aria-label="Breadcrumb" className="mb-8 md:mb-10">
                <Link to="/projects" className="inline-flex items-center gap-2 text-[13px] text-black/50 hover:text-black transition-colors">
                  <ArrowLeft size={14} /> All projects
                </Link>
              </nav>

              {services.length > 0 && (
                <ul className="flex flex-wrap gap-2 mb-5 md:mb-6">
                  {services.map((s) => (
                    <li key={s} className="border border-black/10 bg-white px-3 py-1 text-[12px] text-black/60">{s}</li>
                  ))}
                </ul>
              )}

              <h1 className="text-[clamp(2.5rem,5.5vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.035em] mb-5 md:mb-6">{name}</h1>
              {a.tagline && (
                <p className="max-w-[640px] text-[clamp(1.2rem,2vw,1.6rem)] leading-[1.3] tracking-[-0.015em] text-muted-foreground font-medium mb-8 md:mb-10">
                  {a.tagline}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {a.website_url && (
                  <a
                    href={a.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-center gap-2.5 bg-black text-white px-6 py-3.5 text-[14px] font-medium hover:bg-black/85 transition-colors"
                  >
                    Visit {site || "website"}
                    <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="inline-flex items-center justify-center gap-2 border border-black/15 bg-white px-6 py-3.5 text-[14px] font-medium hover:border-black/40 transition-colors"
                >
                  Start a similar project
                </button>
              </div>
            </div>

            {(heroImg || SHOW_IMAGE_PLACEHOLDERS) && (
              <figure className="border border-border bg-white shadow-[0_16px_48px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-1.5 px-3.5 h-8 border-b border-border bg-[#fafafa]">
                  <span className="keep-round w-2 h-2 bg-black/15" />
                  <span className="keep-round w-2 h-2 bg-black/15" />
                  <span className="keep-round w-2 h-2 bg-black/15" />
                  {site && <span className="ml-2.5 text-[11px] text-black/40 truncate">{site}</span>}
                </div>
                {heroImg ? (
                  <img src={heroImg} alt={`${name} website designed by Kola Communications`} className="w-full aspect-[16/10] object-cover object-top block" />
                ) : (
                  <ImagePlaceholder label="Featured image" size="Website screenshot · 1600 × 1000" className="aspect-[16/10] w-full" />
                )}
              </figure>
            )}
          </header>

          {/* ═══ KEY DETAILS ═══ */}
          {details.length > 0 && (
            <dl className={`grid grid-cols-2 ${LG_COLS[Math.min(details.length, 4)]} gap-px bg-border border border-border mb-10 md:mb-14`}>
              {details.map((d) => (
                <div key={d.label} className="bg-white p-5 md:p-7">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-2 md:mb-3">{d.label}</dt>
                  <dd className="text-[15px] md:text-[17px] font-medium leading-snug">{d.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {/* ═══ BODY ═══ */}
          <div>
            {(a.about_client || overview) && (
              <SectionRow label="Overview">
                {a.about_client && (
                  <p className="max-w-[820px] text-[19px] md:text-[22px] leading-[1.5] tracking-[-0.01em] text-black mb-6">{a.about_client}</p>
                )}
                {overview && <Prose html={overview} />}
              </SectionRow>
            )}

            {a.brief && (
              <SectionRow label="The brief">
                <h2 className="sr-only">The brief</h2>
                <p className="max-w-[760px] text-[16px] md:text-[17px] leading-[1.75] text-black/70">{a.brief}</p>
              </SectionRow>
            )}

            {a.approach && (
              <SectionRow label="Our approach">
                {a.approach_heading && (
                  <h2 className="max-w-[760px] text-[24px] md:text-[30px] font-semibold leading-[1.2] tracking-[-0.02em] mb-6">{a.approach_heading}</h2>
                )}
                <Prose html={a.approach} />
              </SectionRow>
            )}

            {deliverables.length > 0 && (
              <SectionRow label="What we delivered">
                <h2 className="sr-only">What we delivered</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 max-w-[900px]">
                  {deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-3 py-3.5 border-b border-border text-[15px] md:text-[16px]">
                      <Check size={17} className="shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </SectionRow>
            )}

            {tags.length > 0 && (
              <SectionRow label="Tags">
                <h2 className="sr-only">Project tags</h2>
                <ul className="flex flex-wrap gap-2 max-w-[900px]">
                  {tags.map((t) => (
                    <li key={t.slug}>
                      <Link
                        to={`/projects?tag=${encodeURIComponent(t.slug)}`}
                        className="inline-flex items-center border border-black/10 bg-white px-3.5 py-1.5 text-[13px] text-black/70 hover:border-black/40 hover:text-black transition-colors"
                      >
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </SectionRow>
            )}

            {results.length > 0 && (
              <SectionRow label="Results">
                <h2 className="sr-only">Results</h2>
                <ul className={`grid grid-cols-1 ${results.length > 1 ? "sm:grid-cols-2" : ""} gap-px bg-border border border-border max-w-[900px]`}>
                  {results.map((r) => (
                    <li key={r} className="bg-black text-white p-6 md:p-8 text-[20px] md:text-[24px] font-semibold leading-snug tracking-[-0.01em]">{r}</li>
                  ))}
                </ul>
              </SectionRow>
            )}

            {faqs.length > 0 && (
              <SectionRow label="FAQs" id="faqs">
                <h2 className="sr-only">Frequently asked questions</h2>
                <Faq items={faqs} />
              </SectionRow>
            )}
          </div>

          {/* ═══ CTA ═══ */}
          <section className="my-12 md:my-20 bg-black text-white p-8 md:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-end">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/50 mb-3">Work with us</p>
              <h2 className="text-[clamp(1.8rem,3.6vw,3rem)] font-semibold leading-[1.08] tracking-[-0.02em] max-w-[720px]">
                Planning something like {name}? Let's talk.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="group inline-flex items-center justify-center gap-2.5 bg-white text-black px-7 py-4 text-[14px] font-medium hover:bg-white/90 transition-colors"
            >
              Start your project <ArrowUpRight size={16} />
            </button>
          </section>

          {/* ═══ MORE PROJECTS ═══ */}
          {more.length > 0 && (
            <section className="pb-16 md:pb-24">
              <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
                <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] font-semibold tracking-[-0.02em]">More projects</h2>
                <Link to="/projects" className="inline-flex items-center gap-1.5 text-[14px] font-medium hover:underline">
                  View all <ArrowUpRight size={15} />
                </Link>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border">
                {more.map((p) => {
                  const pname = p.acf?.project_name || decode(p.title.rendered);
                  const img = p._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
                  return (
                    <li key={p.id} className="bg-white">
                      <Link to={`/${p.slug}`} className="group flex flex-col h-full p-6 md:p-7 hover:bg-black/[0.02] transition-colors">
                        {img && <img src={img} alt={pname} loading="lazy" className="aspect-[16/10] w-full object-cover object-top border border-border mb-5" />}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-[17px] font-semibold mb-1">{pname}</h3>
                            {p.acf?.industry && <p className="text-[13px] text-black/50">{p.acf.industry}</p>}
                          </div>
                          <ArrowUpRight size={17} className="shrink-0 text-black/30 group-hover:text-black transition-colors" />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </article>
      </div>

      <CTAFooter />
    </div>
  );
};

const ProjectDetail = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const initial = typeof window !== "undefined" ? (window as any).__INITIAL_DATA__?.project : null;
  const [project, setProject] = useState<WPProject | null | undefined>(
    initial?.slug === slug ? initial : undefined
  );

  useEffect(() => {
    if (project && project.slug === slug) return;
    let cancelled = false;
    setProject((p) => (p?.slug === slug ? p : undefined));
    fetchProject(slug)
      .then((p) => { if (!cancelled) setProject(p); })
      .catch(() => { if (!cancelled) setProject(null); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (project === undefined) return <Loading />;
  if (project === null) return <NotFound />;
  if (!hasNewFields(project)) return <LegacyProjectPage />;
  return (
    <AnimatePresence mode="wait">
      <motion.div key={project.slug} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <CaseStudy project={project} />
      </motion.div>
    </AnimatePresence>
  );
};

export default ProjectDetail;
