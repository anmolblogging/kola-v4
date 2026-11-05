import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  Globe,
  Search,
  Smartphone,
  Sparkles,
  Star,
  Check,
} from "lucide-react";
import { PROJECTS, QUOTES, LOGOS, useCycle, chromeDots } from "./heroData";

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};

const Chrome = ({ domain }: { domain: string }) => (
  <div className="flex items-center gap-1.5 px-3 h-7 border-b border-black/[0.06] bg-[#fafafa] shrink-0">
    <span className={chromeDots} />
    <span className={chromeDots} />
    <span className={chromeDots} />
    <span className="ml-2 truncate text-[10px] text-black/40">{domain}</span>
  </div>
);

const Tag = ({ icon: Icon, children }: { icon: typeof Globe; children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.1em] text-black/45">
    <Icon size={12} strokeWidth={1.75} /> {children}
  </span>
);

const Phone = ({ src, alt, className = "" }: { src: string; alt: string; className?: string }) => (
  <div className={`device-phone bg-black p-[5px] shadow-[0_16px_40px_rgba(0,0,0,0.18)] ${className}`}>
    <div className="device-phone-screen overflow-hidden bg-white aspect-[9/19.5]">
      <img src={src} alt={alt} className="w-full h-full object-cover object-top" loading="eager" decoding="async" />
    </div>
  </div>
);

/* ═══════════════ E · BENTO GRID ═══════════════ */
export const HeroBento = memo(() => {
  const web = PROJECTS[0];
  const app = PROJECTS[1];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
      {/* Website */}
      <Link to={`/${web.slug}`} className="group col-span-2 sm:col-span-4 sm:row-span-2 bg-white border border-black/10 flex flex-col overflow-hidden">
        <Chrome domain={web.domain} />
        <div className="relative flex-1 min-h-[150px] overflow-hidden">
          <img src={web.img} alt={`${web.name} website by Kola Communications`} className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]" />
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-black/[0.06]">
          <Tag icon={Globe}>Website development</Tag>
          <ArrowUpRight size={14} className="text-black/30 group-hover:text-black transition-colors" />
        </div>
      </Link>

      {/* App */}
      <div className="col-span-1 sm:col-span-2 sm:row-span-2 bg-[#f3f3f3] border border-black/10 flex flex-col items-center justify-between p-4 gap-3">
        <Phone src={app.mobile!} alt={`${app.name} on mobile`} className="w-[92px] sm:w-[118px]" />
        <Tag icon={Smartphone}>Mobile apps</Tag>
      </div>

      {/* Search */}
      <div className="col-span-1 sm:col-span-2 bg-white border border-black/10 p-4 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 border border-black/10 px-2 py-1.5 text-[10.5px] text-black/45">
            <Search size={11} /> web design agency mumbai
          </div>
          <p className="text-[10px] text-black/40 truncate">kolacommunications.com</p>
          <p className="text-[12px] font-medium text-[#1a0dab] leading-snug line-clamp-2">Website &amp; Digital Marketing Agency | Kola</p>
        </div>
        <Tag icon={Search}>SEO, AEO &amp; GEO</Tag>
      </div>

      {/* AI */}
      <div className="col-span-1 sm:col-span-2 bg-white border border-black/10 p-4 flex flex-col justify-between gap-3">
        <div className="space-y-1.5 text-[10.5px] leading-snug">
          <p className="ml-auto w-fit max-w-[90%] bg-black text-white px-2 py-1">Follow up with today's new leads</p>
          <p className="w-fit max-w-[90%] bg-black/[0.05] px-2 py-1 text-black/70">Done. Replies sent on WhatsApp and email.</p>
        </div>
        <Tag icon={Bot}>AI automation</Tag>
      </div>

      {/* Number */}
      <div className="col-span-2 sm:col-span-2 bg-black text-white p-4 flex flex-col justify-between gap-2">
        <Sparkles size={14} className="text-white/50" />
        <div>
          <p className="text-[30px] font-semibold leading-none tracking-[-0.02em]">199+</p>
          <p className="text-[12px] text-white/60 mt-1">Brands scaled across 6 markets</p>
        </div>
      </div>
    </div>
  );
});

/* ═══════════════ F · LAPTOP + PHONE ═══════════════ */
export const HeroDevices = memo(() => {
  const list = PROJECTS.filter((p) => p.mobile);
  const [i, setI] = useCycle(list.length, 4500);
  const p = list[i];
  return (
    <div>
      <div className="relative pb-6 sm:pb-10 pr-10 sm:pr-16">
        {/* Laptop */}
        <div className="device-laptop bg-[#1b1b1b] p-2 sm:p-3 pb-3 sm:pb-4">
          <div className="device-screen relative overflow-hidden bg-white aspect-[16/10]">
            <AnimatePresence mode="wait">
              <motion.img key={p.img} src={p.img} alt={`${p.name} website`} className="absolute inset-0 w-full h-full object-cover object-top" {...fade} />
            </AnimatePresence>
          </div>
        </div>
        <div className="device-laptop-base mx-[-4%] h-3 sm:h-4 bg-gradient-to-b from-[#d9d9d9] to-[#bdbdbd]" />
        {/* Phone */}
        <div className="absolute right-0 bottom-0 w-[28%] max-w-[150px]">
          <AnimatePresence mode="wait">
            <motion.div key={p.mobile} {...fade}>
              <Phone src={p.mobile!} alt={`${p.name} on mobile`} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <Link to={`/${p.slug}`} className="group min-w-0">
          <p className="text-[14px] font-semibold truncate group-hover:underline">{p.name}</p>
          <p className="text-[12px] text-black/45 truncate">{p.type}</p>
        </Link>
        <div className="flex gap-1.5">
          {list.map((x, n) => (
            <button key={x.slug} onClick={() => setI(n)} aria-label={`Show ${x.name}`} className={`h-1 transition-all ${n === i ? "w-6 bg-black" : "w-3 bg-black/15"}`} />
          ))}
        </div>
      </div>
    </div>
  );
});

/* ═══════════════ G · CASE STUDY SPOTLIGHT ═══════════════ */
export const HeroSpotlight = memo(() => {
  const list = PROJECTS.slice(0, 4);
  const [paused, setPaused] = useState(false);
  const [i, setI] = useCycle(list.length, 5500, paused);
  const p = list[i];
  return (
    <div className="bg-white border border-black/10 shadow-[0_12px_40px_rgba(0,0,0,0.06)]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* progress */}
      <div className="grid grid-cols-4 gap-1 p-3 pb-0">
        {list.map((x, n) => (
          <button key={x.slug} onClick={() => setI(n)} aria-label={`Show ${x.name}`} className="h-[3px] bg-black/10 overflow-hidden">
            <span
              key={`${i}-${n}`}
              className="block h-full bg-black"
              style={{
                width: n < i ? "100%" : n === i ? undefined : "0%",
                animation: n === i ? `hero-progress 5.5s linear forwards` : undefined,
                animationPlayState: paused ? "paused" : "running",
              }}
            />
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={p.slug} {...fade}>
          <div className="relative m-3 aspect-[16/10] overflow-hidden border border-black/[0.06]">
            <img src={p.img} alt={`${p.name} website`} className="absolute inset-0 w-full h-full object-cover object-top" />
            <span className="absolute top-3 left-3 bg-white/95 border border-black/10 px-2 py-1 text-[10.5px] font-medium">{p.type}</span>
          </div>
          <div className="px-4 md:px-5 pb-4 md:pb-5">
            <p className="text-[11px] uppercase tracking-[0.12em] text-black/40 mb-1">Case study</p>
            <h3 className="text-[18px] md:text-[20px] font-semibold tracking-[-0.01em] mb-1">{p.name}</h3>
            <p className="text-[13.5px] text-black/55 leading-relaxed mb-4">{p.tagline}</p>
            <div className="grid grid-cols-3 border-t border-black/[0.08] pt-3 mb-4">
              {p.stats.map((s) => (
                <div key={s.label}>
                  <p className="text-[20px] md:text-[22px] font-semibold leading-none">{s.value}</p>
                  <p className="text-[11px] text-black/45 mt-1 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
            <Link to={`/${p.slug}`} className="inline-flex items-center gap-1.5 text-[13px] font-medium hover:underline">
              Read the case study <ArrowUpRight size={14} />
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

/* ═══════════════ H · SERVICE PICKER ═══════════════ */
const PICKS = [
  { key: "web", label: "Websites", icon: Globe, href: "/services#web-dev", line: "Fast, SEO-ready WordPress, Shopify and custom-coded websites." },
  { key: "seo", label: "SEO & AEO", icon: Search, href: "/services#seo-aeo", line: "Get found on Google and recommended by ChatGPT, Gemini and Perplexity." },
  { key: "ai", label: "AI automation", icon: Bot, href: "/services#ai-automation", line: "Chatbots, AI agents and workflows that save your team hours every week." },
  { key: "app", label: "Mobile apps", icon: Smartphone, href: "/services#mobile-app-development", line: "iOS and Android apps, from MVP to App Store launch." },
] as const;

const PickVisual = ({ k }: { k: (typeof PICKS)[number]["key"] }) => {
  if (k === "web")
    return (
      <div className="h-full bg-white border border-black/10 flex flex-col overflow-hidden">
        <Chrome domain={PROJECTS[0].domain} />
        <div className="relative flex-1"><img src={PROJECTS[0].img} alt="Livyor website" className="absolute inset-0 w-full h-full object-cover object-top" /></div>
      </div>
    );
  if (k === "seo")
    return (
      <div className="h-full bg-white border border-black/10 p-4 sm:p-5 flex flex-col gap-3 justify-center">
        <div className="flex items-center gap-2 border border-black/10 bg-[#fafafa] px-3 py-2 text-[12.5px] text-black/60"><Search size={13} /> best web design agency in mumbai</div>
        <div className="border border-black/10 p-3">
          <p className="flex items-center gap-1.5 text-[11px] text-black/45 mb-1.5"><Sparkles size={12} /> AI overview</p>
          <p className="text-[13px] leading-relaxed text-black/70"><span className="bg-black text-white px-1">Kola Communications</span> builds fast, SEO-ready websites and optimises brands for Google and AI search.</p>
        </div>
        {[0, 1].map((n) => (
          <div key={n} className="space-y-1.5"><div className="h-2 w-1/3 bg-black/10" /><div className="h-2.5 w-3/4 bg-[#1a0dab]/25" /><div className="h-2 w-full bg-black/[0.06]" /></div>
        ))}
      </div>
    );
  if (k === "ai")
    return (
      <div className="h-full bg-white border border-black/10 p-4 sm:p-5 flex flex-col justify-center gap-2.5 text-[13px]">
        <p className="ml-auto max-w-[80%] bg-black text-white px-3 py-2">Hi, do you deliver to Pune?</p>
        <p className="max-w-[85%] bg-black/[0.05] px-3 py-2 text-black/75">Yes, we deliver across India in 3 to 5 days. Want me to share today's offers?</p>
        <p className="ml-auto max-w-[80%] bg-black text-white px-3 py-2">Yes please</p>
        <p className="flex items-center gap-1.5 text-[11px] text-black/40 mt-1"><Check size={12} /> Lead saved to CRM · team notified</p>
      </div>
    );
  return (
    <div className="h-full bg-[#f3f3f3] border border-black/10 flex items-center justify-center gap-4 p-4">
      <Phone src={PROJECTS[1].mobile!} alt="App on iPhone" className="w-[110px] sm:w-[130px]" />
      <Phone src={PROJECTS[2].mobile!} alt="App on Android" className="w-[110px] sm:w-[130px] hidden sm:block translate-y-6" />
    </div>
  );
};

export const HeroPicker = memo(() => {
  const [manual, setManual] = useState(false);
  const [i, setI] = useCycle(PICKS.length, 4000, manual);
  const pick = PICKS[i];
  return (
    <div>
      <div role="tablist" className="grid grid-cols-4 border border-black/10 bg-white mb-3">
        {PICKS.map((p, n) => {
          const Icon = p.icon;
          const on = n === i;
          return (
            <button
              key={p.key}
              role="tab"
              aria-selected={on}
              onClick={() => { setManual(true); setI(n); }}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 px-2 py-3 text-[11.5px] sm:text-[13px] font-medium border-r last:border-r-0 border-black/10 transition-colors ${on ? "bg-black text-white" : "text-black/55 hover:text-black"}`}
            >
              <Icon size={15} strokeWidth={1.75} /> {p.label}
            </button>
          );
        })}
      </div>
      <div className="h-[300px] sm:h-[360px] lg:h-[380px]">
        <AnimatePresence mode="wait">
          <motion.div key={pick.key} className="h-full" {...fade}><PickVisual k={pick.key} /></motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="text-[13.5px] text-black/60">{pick.line}</p>
        <Link to={pick.href} className="shrink-0 inline-flex items-center gap-1 text-[13px] font-medium hover:underline">Learn more <ArrowUpRight size={14} /></Link>
      </div>
    </div>
  );
});

/* ═══════════════ I · TESTIMONIAL + LOGOS ═══════════════ */
export const HeroTrust = memo(() => {
  const [i, setI] = useCycle(QUOTES.length, 6000);
  const q = QUOTES[i];
  const initials = q.name.split(" ").map((w) => w[0]).join("");
  return (
    <div className="space-y-3">
      <div className="bg-white border border-black/10 p-5 md:p-7 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
        <div className="flex gap-0.5 mb-4">{[0, 1, 2, 3, 4].map((n) => <Star key={n} size={15} className="fill-black text-black" />)}</div>
        <AnimatePresence mode="wait">
          <motion.div key={q.name} {...fade}>
            <p className="text-[18px] md:text-[22px] leading-[1.4] tracking-[-0.01em] font-medium min-h-[100px] md:min-h-[124px]">“{q.quote}”</p>
            <div className="flex items-center gap-3 mt-5">
              <span className="keep-round w-10 h-10 bg-black text-white flex items-center justify-center text-[13px] font-semibold">{initials}</span>
              <div>
                <p className="text-[14px] font-semibold">{q.name}</p>
                <p className="text-[12.5px] text-black/45">{q.title}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="flex gap-1.5 mt-5">
          {QUOTES.map((x, n) => (
            <button key={x.name} onClick={() => setI(n)} aria-label={`Show quote from ${x.name}`} className={`h-1 transition-all ${n === i ? "w-6 bg-black" : "w-3 bg-black/15"}`} />
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.12em] text-black/40 mb-2">Trusted by</p>
        <div className="grid grid-cols-3 gap-px bg-black/10 border border-black/10">
          {LOGOS.map((l) => (
            <div key={l.alt} className="bg-white h-[72px] md:h-[84px] flex items-center justify-center p-3">
              <img src={l.src} alt={l.alt} className="max-h-full max-w-[80%] object-contain grayscale opacity-70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
