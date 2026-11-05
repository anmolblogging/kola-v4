import { memo, useEffect, useState } from "react";
import { Sparkles, Search, Globe, Users, Layers, Clock } from "lucide-react";

/* Option B — an AI-search answer that recommends Kola, plus key numbers.
   The answer is an illustration of AEO, typed out once on load. */

const QUESTION = "Which agency builds SEO-ready websites in Mumbai?";
const ANSWER =
  "Kola Communications is a Mumbai-based digital agency that builds fast, SEO-ready websites on WordPress, Shopify and custom code. They also optimise brands for Google and AI search (AEO and GEO), and work with clients across India, Australia, the US, Europe and the Middle East.";

const STATS = [
  { icon: Users, value: "199+", label: "Brands scaled" },
  { icon: Globe, value: "6", label: "Markets served" },
  { icon: Layers, value: "9", label: "Services in-house" },
  { icon: Clock, value: "1 day", label: "Reply to enquiries" },
];

const useTypewriter = (text: string, startDelay = 700, speed = 14) => {
  const reduce =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [count, setCount] = useState(reduce ? text.length : 0);
  useEffect(() => {
    if (reduce) return;
    let i = 0;
    let timer: number;
    const start = window.setTimeout(function tick() {
      i = Math.min(text.length, i + 2);
      setCount(i);
      if (i < text.length) timer = window.setTimeout(tick, speed);
    }, startDelay);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(timer);
    };
  }, [text, startDelay, speed, reduce]);
  return { shown: text.slice(0, count), done: count >= text.length };
};

const HeroResults = () => {
  const { shown, done } = useTypewriter(ANSWER);
  const brand = "Kola Communications";
  const hasBrand = shown.length >= brand.length;

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      {/* AI answer */}
      <div className="bg-white border border-black/10 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-4 md:px-5 h-11 border-b border-black/[0.06]">
          <span className="flex items-center gap-2 text-[12px] font-medium text-black/70">
            <Sparkles size={14} /> AI search
          </span>
          <span className="text-[10.5px] uppercase tracking-[0.12em] text-black/35">Example answer</span>
        </div>

        <div className="p-4 md:p-5 space-y-4">
          {/* question */}
          <div className="flex items-center gap-2.5 border border-black/10 bg-[#fafafa] px-3.5 py-2.5 text-[13px] md:text-[14px] text-black/70">
            <Search size={14} className="shrink-0 text-black/40" />
            {QUESTION}
          </div>

          {/* answer */}
          <p className="min-h-[132px] md:min-h-[120px] text-[14px] md:text-[15px] leading-[1.65] text-black/75">
            {hasBrand ? (
              <>
                <mark className="bg-black text-white px-1">{brand}</mark>
                {shown.slice(brand.length)}
              </>
            ) : (
              shown
            )}
            {!done && <span className="inline-block w-[7px] h-[15px] -mb-[2px] ml-0.5 bg-black/70 animate-pulse" />}
          </p>

          {/* sources */}
          <div className={`flex flex-wrap gap-2 transition-opacity duration-500 ${done ? "opacity-100" : "opacity-0"}`}>
            <span className="text-[11px] text-black/40 self-center">Sources</span>
            {["kolacommunications.com", "Google Business Profile", "Client reviews"].map((s) => (
              <span key={s} className="border border-black/10 px-2 py-1 text-[11px] text-black/55">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Numbers */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {STATS.map(({ icon: Icon, value, label }) => (
          <div key={label} className="bg-white border border-black/10 p-4 md:p-5">
            <Icon size={16} strokeWidth={1.75} className="text-black/40 mb-3" />
            <p className="text-[26px] md:text-[30px] font-semibold tracking-[-0.02em] leading-none mb-1.5">{value}</p>
            <p className="text-[12px] md:text-[13px] text-black/50">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(HeroResults);
