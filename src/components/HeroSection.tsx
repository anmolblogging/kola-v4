import { useState, useEffect, useRef } from "react";
import { motion, useAnimationFrame } from "framer-motion";
import { ArrowUpRight, Megaphone, Star, Play } from "lucide-react";
import { Link } from "react-router-dom";
import ContactForm from "@/components/ContactForm";

/* The brand blue, sampled straight from the KOLA logo. It carries the
   highlight box, icon badge, CTA, rating stars and the gradient band —
   swap this one value to re-tint the whole section. */
const BRAND = "#3A3ABE";

/* ─── Client Avatars for Social Proof ─── */
const clientAvatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
];

/* ─── Featured Showcase Projects for Reel ─── */
const showcaseProjects = [
  {
    title: "Tazaari Platform",
    category: "E-Commerce & Scale",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
    slug: "tazaari-shop",
  },
  {
    title: "Veena Developers",
    category: "Real Estate & Lead Gen",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
    slug: "veena-developers",
  },
  {
    title: "Zenith Labs",
    category: "HealthTech & Brand",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    slug: "zenith-labs",
  },
  {
    title: "Horizon Media",
    category: "Digital Performance",
    image:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80",
    slug: "horizon-media",
  },
  {
    title: "BrightPath UK",
    category: "Web & Global SEO",
    image:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
    slug: "brightpath-uk",
  },
  {
    title: "Nexus Architecture",
    category: "Design System & Web",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    slug: "nexus-architecture",
  },
];

/* ─── Generic horizontal marquee, driven off one rAF ─── */
const useMarquee = (speed: number, paused = false) => {
  const x = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const halfWidthRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const raf = requestAnimationFrame(() => {
      if (containerRef.current) {
        halfWidthRef.current = containerRef.current.scrollWidth / 2;
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useAnimationFrame((_, delta) => {
    if (halfWidthRef.current === 0 || paused) return;
    x.current -= (speed * delta) / 1000;
    if (x.current <= -halfWidthRef.current) x.current += halfWidthRef.current;
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${x.current}px)`;
    }
  });

  return containerRef;
};

/* ─── Infinite Marquee Showcase Reel ─── */
const ShowcaseReel = () => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useMarquee(40, isHovered);
  const doubledProjects = [...showcaseProjects, ...showcaseProjects];

  return (
    <div
      className="relative w-full overflow-hidden pt-4 pb-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-background via-background/60 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-background via-background/60 to-transparent z-10" />

      <div
        ref={containerRef}
        className="flex items-center gap-3.5 sm:gap-5 md:gap-6 whitespace-nowrap will-change-transform"
      >
        {doubledProjects.map((item, i) => (
          <Link
            key={i}
            to="/projects"
            className="
              group relative block shrink-0
              w-[200px] sm:w-[250px] md:w-[295px] lg:w-[325px]
              rounded-2xl overflow-hidden
              border border-border/70 bg-card p-2 sm:p-2.5
              shadow-[0_4px_20px_rgba(0,0,0,0.03)]
              hover:shadow-[0_14px_34px_-12px_rgba(0,0,0,0.18)]
              hover:border-foreground/25 hover:-translate-y-1
              transition-all duration-500 ease-out
            "
          >
            {/* Image panel */}
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-muted">
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover grayscale-[25%] group-hover:grayscale-0 group-hover:scale-[1.06] transition-all duration-700 ease-out"
              />
              {/* Index chip */}
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider text-white bg-black/45 backdrop-blur-sm">
                {String((i % showcaseProjects.length) + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Caption bar */}
            <div className="flex items-center justify-between gap-2 px-1.5 pt-2.5 pb-1">
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm md:text-[15px] font-bold text-foreground leading-tight truncate">
                  {item.title}
                </h4>
                <span className="mt-0.5 block text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase truncate"
                      style={{ color: BRAND }}>
                  {item.category}
                </span>
              </div>
              <div className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-foreground/60 shrink-0
                              group-hover:bg-foreground group-hover:text-background group-hover:border-foreground
                              group-hover:rotate-45 transition-all duration-300">
                <ArrowUpRight size={13} />
              </div>
            </div>

            {/* Accent underline */}
            <span
              className="absolute left-2 right-2 bottom-0 h-[2px] rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
              style={{ backgroundColor: BRAND }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

/* ─── Main Hero Section ───
   One layered stage rather than two columns: the headline sits behind the
   robot and the robot stands in front of it, so the type runs behind the
   figure. The scene is set to global mouse events, so the canvas can ignore
   pointer input entirely — the robot still tracks the cursor anywhere on
   the page, while clicks pass through to the button beneath it. ─── */
const HeroSection = () => {
  const [contactOpen, setContactOpen] = useState(false);
  const splineRef = useRef<HTMLElement>(null);

  /* The "Built with Spline" badge lives inside the viewer's shadow root, so
     it can't be reached with CSS — poll briefly after mount and drop it. */
  useEffect(() => {
    const strip = () => {
      const root = (splineRef.current as any)?.shadowRoot as ShadowRoot | undefined;
      const badge = root?.querySelector("#logo");
      if (badge) {
        badge.remove();
        return true;
      }
      return false;
    };
    if (strip()) return;
    const id = setInterval(() => { if (strip()) clearInterval(id); }, 200);
    const stop = setTimeout(() => clearInterval(id), 15000);
    return () => { clearInterval(id); clearTimeout(stop); };
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-background text-foreground min-h-[92vh] flex flex-col pt-28 sm:pt-32">
        <ContactForm open={contactOpen} onClose={() => setContactOpen(false)} />

        {/* A faint brand wash from the top */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: `radial-gradient(120% 60% at 50% 0%, ${BRAND}14 0%, transparent 55%)`,
          }}
        />

        {/* Circuit-board backdrop, drawn rather than fetched */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 w-full h-full opacity-[0.13]"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="kola-circuit"
              width="180"
              height="180"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 40 H70 L100 70 H180 M0 130 H50 L80 100 H180 M40 0 V25 M140 180 V150"
                fill="none"
                stroke={BRAND}
                strokeWidth="1"
              />
              <circle cx="70" cy="40" r="3" fill={BRAND} />
              <circle cx="80" cy="100" r="3" fill={BRAND} />
              <circle cx="140" cy="150" r="3" fill={BRAND} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#kola-circuit)" />
        </svg>

        <div className="relative z-10 flex-1 max-w-[1240px] w-full mx-auto px-6 md:px-10 py-6 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr] lg:grid-cols-[1.05fr_0.95fr] gap-8 md:gap-8 lg:gap-12 items-center h-full">
            {/* ================= LEFT: THE WORDS ================= */}
            <div className="text-center md:text-left">
              {/* EYEBROW */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2.5 mb-6"
              >
                <span
                  className="px-1.5 py-0.5 rounded-[5px] text-[11px] font-bold text-white"
                  style={{ backgroundColor: BRAND }}
                >
                  199+
                </span>
                <span className="text-[11px] sm:text-[12px] font-medium tracking-[0.14em] uppercase text-muted-foreground">
                  Brands grown across 6 global markets
                </span>
              </motion.div>

              {/* HEADLINE */}
              <h1
                className="
                  mb-6
                  text-[clamp(2.1rem,4.4vw,3.7rem)]
                  leading-[1.06]
                  tracking-[-0.02em]
                "
              >
                <motion.span
                  initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-x-[0.25em] text-muted-foreground font-medium"
                >
                  <span>We Are Your</span>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.85, rotate: 0 }}
                    animate={{ opacity: 1, scale: 1, rotate: -3 }}
                    transition={{
                      delay: 0.3,
                      type: "spring",
                      stiffness: 160,
                      damping: 15,
                    }}
                    className="inline-block px-[0.14em] pb-[0.06em] text-white"
                    style={{ backgroundColor: BRAND }}
                  >
                    Digital
                  </motion.span>
                </motion.span>

                <motion.span
                  initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.7,
                    delay: 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-x-[0.22em] text-foreground font-semibold"
                >
                  <span>Growth</span>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.4, rotate: -40 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.45,
                      type: "spring",
                      stiffness: 180,
                      damping: 13,
                    }}
                    className="inline-flex items-center justify-center shrink-0 rounded-full w-[0.95em] h-[0.95em] text-white"
                    style={{ backgroundColor: BRAND }}
                  >
                    <Megaphone className="w-[0.5em] h-[0.5em] -rotate-12" />
                  </motion.span>
                  <span>Partner.</span>
                </motion.span>
              </h1>

              {/* SUB-HEADLINE */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="text-base sm:text-lg text-muted-foreground max-w-[500px] mx-auto lg:mx-0 leading-[1.65] mb-8"
              >
                From high-performance websites to SEO and lead generation, we
                craft data-driven strategies for brands ready to scale bold.
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="mb-8"
              >
                <button
                  onClick={() => setContactOpen(true)}
                  className="
                    group inline-flex items-center gap-2.5
                    pl-7 pr-2.5 py-2.5 rounded-full
                    text-sm font-medium text-white
                    shadow-[0_6px_24px_rgba(58,58,190,0.3)]
                    hover:opacity-90 transition-opacity
                  "
                  style={{ backgroundColor: BRAND }}
                >
                  <span>Book a Call</span>
                  <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <Play size={12} className="fill-current ml-0.5" />
                  </span>
                </button>
              </motion.div>

              {/* AVATARS + RATING */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.65 }}
                className="flex items-center justify-center lg:justify-start gap-3.5"
              >
                <div className="flex -space-x-3">
                  {clientAvatars.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      loading="lazy"
                      className="w-10 h-10 rounded-full border-2 border-background object-cover"
                    />
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex gap-0.5 mb-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        style={{ color: BRAND, fill: BRAND }}
                      />
                    ))}
                  </div>
                  <p className="text-[14px] font-semibold">199+ Global Founders & Clients</p>
                </div>
              </motion.div>
            </div>

            {/* ================= RIGHT: THE ROBOT =================
                The scene paints its own opaque ground, so the panel is given
                that same tone deliberately — a designed card rather than a
                stray box sitting on the page. */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-[320px] sm:h-[380px] md:h-[440px] lg:h-[600px] rounded-3xl overflow-hidden bg-[#EAEAEA]"
            >
              <spline-viewer
                ref={splineRef}
                url="https://prod.spline.design/zyP-FoNAy1RNLOZx/scene.splinecode"
                className="w-full h-full block pointer-events-none"
              />

            </motion.div>
          </div>
        </div>
      </section>

      {/* THE WORK ITSELF */}
      <div className="pt-14 sm:pt-16">
        <ShowcaseReel />
      </div>
    </>
  );
};

export default HeroSection;
