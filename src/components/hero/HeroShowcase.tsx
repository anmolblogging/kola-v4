import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

/* Option A — real client websites in browser frames, drifting slowly.
   Screenshots live in /public/hero (960x600 WebP, ~15–50 KB each). */

type Work = { slug: string; name: string; type: string; domain: string; img: string };

const WORK: Work[] = [
  { slug: "livyor", name: "Livyor", type: "Shopify store", domain: "livyor.com", img: "/hero/livyor.webp" },
  { slug: "dhanuka-investments", name: "Dhanuka Investments", type: "Real estate platform", domain: "dhanukainvestments.com", img: "/hero/dhanuka.webp" },
  { slug: "tazaari", name: "Tazaari", type: "Fashion e-commerce", domain: "tazaari.com", img: "/hero/tazaari.webp" },
  { slug: "carpet-cuts", name: "Carpet Cuts", type: "E-commerce, Australia", domain: "carpetcuts.au", img: "/hero/carpetcuts.webp" },
  { slug: "revent-ai", name: "Revent AI", type: "SaaS website", domain: "revent.ai", img: "/hero/revent.webp" },
];

const COL_A = [WORK[0], WORK[2], WORK[4]];
const COL_B = [WORK[1], WORK[3], WORK[0]];

const BrowserCard = ({ work, eager = false }: { work: Work; eager?: boolean }) => (
  <Link
    to={`/${work.slug}`}
    className="group/card block bg-white border border-black/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden"
    aria-label={`${work.name} — ${work.type}`}
  >
    {/* browser chrome */}
    <div className="flex items-center gap-1.5 px-3 h-7 border-b border-black/[0.06] bg-[#fafafa]">
      <span className="keep-round w-2 h-2 bg-black/15" />
      <span className="keep-round w-2 h-2 bg-black/15" />
      <span className="keep-round w-2 h-2 bg-black/15" />
      <span className="ml-2 truncate text-[10px] text-black/40">{work.domain}</span>
    </div>
    <div className="relative aspect-[16/10] overflow-hidden bg-black/[0.03]">
      <img
        src={work.img}
        alt={`${work.name} website designed and built by Kola Communications`}
        width={960}
        height={600}
        loading="eager"
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover/card:scale-[1.03]"
      />
    </div>
    <div className="flex items-center justify-between gap-2 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[12.5px] font-semibold leading-tight truncate">{work.name}</p>
        <p className="text-[11px] text-black/45 truncate">{work.type}</p>
      </div>
      <ArrowUpRight size={14} className="shrink-0 text-black/30 group-hover/card:text-black transition-colors" />
    </div>
  </Link>
);

/* Vertical marquee column: list rendered twice so the loop is seamless */
const Column = ({ items, reverse = false, eager = false }: { items: Work[]; reverse?: boolean; eager?: boolean }) => (
  <div className="relative h-full overflow-hidden">
    <div className={`flex flex-col gap-4 ${reverse ? "animate-hero-scroll-down" : "animate-hero-scroll-up"} group-hover:[animation-play-state:paused]`}>
      {[...items, ...items].map((w, i) => (
        <BrowserCard key={`${w.slug}-${i}`} work={w} eager={eager && i < 2} />
      ))}
    </div>
  </div>
);

const HeroShowcase = () => (
  <>
    {/* Desktop & tablet: two drifting columns */}
    <div className="group relative hidden sm:grid grid-cols-2 gap-4 h-[460px] md:h-[520px] lg:h-[560px] [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]">
      <Column items={COL_A} eager />
      <div className="pt-16">
        <Column items={COL_B} reverse />
      </div>
    </div>

    {/* Phones: one horizontal strip */}
    <div className="group sm:hidden -mx-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="flex gap-3 w-max animate-hero-scroll-x">
        {[...WORK, ...WORK].map((w, i) => (
          <div key={`${w.slug}-m-${i}`} className="w-[260px] shrink-0">
            <BrowserCard work={w} eager={i < 2} />
          </div>
        ))}
      </div>
    </div>
  </>
);

export default memo(HeroShowcase);
