import { useState, useRef, memo, useEffect } from "react";
import { ArrowUpRight, Megaphone, Star, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ContactForm from "@/components/ContactForm";

const SPLINE_SCENE = "https://prod.spline.design/zyP-FoNAy1RNLOZx/scene.splinecode";

/* ─── Client Avatars with optimized image dimensions ─── */
const clientAvatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80",
];

/* ─── High Performance 3D Hero Component ─── */
const MainframeHero = () => {
  const [contactOpen, setContactOpen] = useState(false);
  const [is3DLoaded, setIs3DLoaded] = useState(false);
  const splineRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = splineRef.current;
    if (!el) return;

    // Clean spline logo watermark cleanly
    const cleanupBadge = () => {
      const root = (el as any)?.shadowRoot as ShadowRoot | undefined;
      const badge = root?.querySelector("#logo");
      if (badge) {
        badge.remove();
        setIs3DLoaded(true);
        return true;
      }
      return false;
    };

    if (cleanupBadge()) return;

    const observer = new MutationObserver(() => {
      if (cleanupBadge()) {
        observer.disconnect();
      }
    });

    if ((el as any)?.shadowRoot) {
      observer.observe((el as any).shadowRoot, { childList: true, subtree: true });
    }

    const timer = setTimeout(() => {
      cleanupBadge();
      setIs3DLoaded(true);
      observer.disconnect();
    }, 2500);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <ContactForm open={contactOpen} onClose={() => setContactOpen(false)} />

      <section className="relative overflow-hidden min-h-0 lg:min-h-[88vh] flex items-center pt-24 sm:pt-28 md:pt-32 lg:pt-36 pb-8 md:pb-12">
        <div className="section-container w-full max-w-[1080px] mx-auto px-4 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr] lg:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-8 lg:gap-12 items-center">
            {/* ================= LEFT: TYPOGRAPHY & CTA ================= */}
            <div className="text-center md:text-left">
              {/* EYEBROW BADGE */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-black/10 bg-black/[0.02] mb-4 md:mb-6">
                <span className="w-2 h-2 rounded-full bg-black/70 animate-pulse" />
                <span className="text-[11px] md:text-[11.5px] font-medium tracking-wide uppercase text-black/70">
                  199+ Brands Scaled Across 6 Markets
                </span>
              </div>

              <h1 className="mb-4 md:mb-6 text-[clamp(2.1rem,3.8vw,3.8rem)] leading-[1.05] tracking-[-0.02em]">
                <span className="text-foreground font-semibold">We are your </span>
                <span className="text-muted-foreground font-medium">digital growth </span>
                <span className="text-foreground font-semibold">partner.</span>
              </h1>

              {/* SUB-HEADLINE */}
              <p className="text-base md:text-lg text-muted-foreground max-w-[480px] mx-auto md:mx-0 leading-[1.6] md:leading-[1.65] mb-6 md:mb-8">
                From WordPress and Shopify to custom-coded websites, SEO, and AI discovery (AEO), we build digital experiences that get you found and get you chosen.
              </p>

              {/* CTA BUTTON */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5 md:gap-4 mb-6 md:mb-8">
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="
                    group inline-flex items-center gap-3
                    px-6 md:px-7 py-3.5 md:py-4 rounded-full
                    text-sm font-medium text-white bg-black
                    shadow-[0_4px_16px_rgba(0,0,0,0.12)]
                    hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]
                    hover:scale-[1.02] active:scale-[0.98] transition-all duration-200
                  "
                >
                  <span>Start Your Project</span>
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                    <ArrowUpRight size={13} className="text-white" />
                  </span>
                </button>

                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 px-5 py-3.5 md:py-4 rounded-full border border-black/15 bg-black/[0.02] text-sm font-medium text-black hover:border-black/35 hover:bg-black/[0.04] transition-all"
                >
                  <span>View Projects</span>
                  <ArrowRight size={14} className="text-black/50" />
                </Link>
              </div>

            </div>

            {/* ================= RIGHT: HIGH-PERFORMANCE 3D STAGE ================= */}
            <div className="relative h-[320px] sm:h-[380px] md:h-[420px] lg:h-[480px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#F3F4F6] to-[#E5E7EB] border border-black/10 shadow-[0_12px_36px_rgba(0,0,0,0.04)] group">
              <spline-viewer
                ref={splineRef}
                url={SPLINE_SCENE}
                className={`w-full h-full block pointer-events-none transition-opacity duration-500 ${
                  is3DLoaded ? "opacity-100" : "opacity-95"
                }`}
              />

              {/* Bottom Interactive HUD Tag */}
              <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4 z-10 px-3.5 md:px-4 py-2 md:py-2.5 rounded-2xl bg-white/85 backdrop-blur-md border border-black/10 flex items-center justify-between text-xs text-black/70 shadow-sm">
                <span className="font-medium flex items-center gap-1.5 text-[11px] md:text-xs">
                  <Sparkles size={12} className="text-black/60" />
                  Kola 3D Studio Lab
                </span>
                <span className="text-[10px] md:text-[11px] text-black/40">Interactive 3D Stage</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default memo(MainframeHero);







