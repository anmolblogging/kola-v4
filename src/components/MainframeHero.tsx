import { useState, memo } from "react";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ContactForm from "@/components/ContactForm";
import HeroShowcase from "@/components/hero/HeroShowcase";
import HeroResults from "@/components/hero/HeroResults";
import { HeroBento, HeroDevices, HeroSpotlight, HeroPicker, HeroTrust } from "@/components/hero/HeroOptions";


/* ─── High Performance 3D Hero Component ─── */
const MainframeHero = () => {
  const [contactOpen, setContactOpen] = useState(false);
  // Preview switch while choosing a design: ?hero=b shows the results version
  const [variant] = useState<string>(() => {
    const v = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("hero") : null;
    return v && "abefghi".includes(v) ? v : "a";
  });

  return (
    <>
      <ContactForm open={contactOpen} onClose={() => setContactOpen(false)} />

      <section className="relative overflow-hidden min-h-0 lg:min-h-[90vh] flex items-center pt-24 sm:pt-28 md:pt-32 lg:pt-36 pb-8 md:pb-12">
        <div className="section-container w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-12 items-center">
            {/* ================= LEFT: TYPOGRAPHY & CTA ================= */}
            <div className="text-center lg:text-left">
              {/* EYEBROW BADGE */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-black/10 bg-black/[0.02] mb-4 md:mb-6">
                <span className="w-2 h-2 rounded-full bg-black/70 animate-pulse" />
                <span className="text-[11px] md:text-[11.5px] font-medium tracking-wide uppercase text-black/70">
                  199+ Brands Scaled Across 6 Markets
                </span>
              </div>

              <h1 className="mb-4 md:mb-6 text-[clamp(2.1rem,6vw,3.4rem)] lg:text-[clamp(2.2rem,4vw,3.8rem)] leading-[1.05] tracking-[-0.02em]">
                <span className="text-foreground font-semibold">We are your </span>
                <span className="text-muted-foreground font-medium">digital growth </span>
                <span className="text-foreground font-semibold">partner.</span>
              </h1>

              {/* SUB-HEADLINE */}
              <p className="text-base md:text-lg text-muted-foreground max-w-[520px] mx-auto lg:mx-0 leading-[1.6] md:leading-[1.65] mb-6 md:mb-8">
                From WordPress and Shopify to custom-coded websites, SEO, and AI discovery (AEO), we build digital experiences that get you found and get you chosen.
              </p>

              {/* CTA BUTTON */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 max-w-[340px] sm:max-w-none mx-auto lg:mx-0 mb-6 md:mb-8 lg:mb-10">
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="
                    group inline-flex items-center justify-center gap-3
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
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:py-4 rounded-full border border-black/15 bg-black/[0.02] text-sm font-medium text-black hover:border-black/35 hover:bg-black/[0.04] transition-all"
                >
                  <span>View Projects</span>
                  <ArrowRight size={14} className="text-black/50" />
                </Link>
              </div>

            </div>

            {/* ================= RIGHT: PROOF ================= */}
            <div className="relative">
              {variant === "b" ? <HeroResults />
                : variant === "e" ? <HeroBento />
                : variant === "f" ? <HeroDevices />
                : variant === "g" ? <HeroSpotlight />
                : variant === "h" ? <HeroPicker />
                : variant === "i" ? <HeroTrust />
                : <HeroShowcase />}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default memo(MainframeHero);







