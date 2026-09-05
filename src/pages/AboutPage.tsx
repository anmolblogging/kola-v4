import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useInView, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import ColumnGuides from "@/components/ColumnGuides";
import CustomCursor from "@/components/CustomCursor";
import AboutPageHero from "@/components/AboutPageHero";
import SectionDivider from "@/components/SectionDivider";
import TestimonialBanner from "@/components/TestimonialBanner";
import CTAFooter from "@/components/CTAFooter";
import ContactForm from "@/components/ContactForm";
import AnimatedHeading from "@/components/AnimatedHeading";

/* ══════════════════════════════════════════
   ANIMATED COUNTER
   ══════════════════════════════════════════ */

interface CounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const AnimatedCounter = ({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: CounterProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const startTime = performance.now();

    const update = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(ease * value);
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {prefix}
      {decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue)}
      {suffix}
    </span>
  );
};

/* ══════════════════════════════════════════
   DATA
   ══════════════════════════════════════════ */

const stats = [
  {
    target: 218,
    prefix: "+",
    suffix: "%",
    decimals: 0,
    label: "Organic traffic",
    sub: "average client growth",
  },
  {
    target: 4.7,
    prefix: "",
    suffix: "x",
    decimals: 1,
    label: "Lead gen rate",
    sub: "vs industry standard",
  },
  {
    target: 8.9,
    prefix: "",
    suffix: "x",
    decimals: 1,
    label: "Paid ROAS",
    sub: "month-3 campaign returns",
  },
  {
    target: 150,
    prefix: "",
    suffix: "+",
    decimals: 0,
    label: "Websites delivered",
    sub: "across 6 markets",
  },
];

const capabilities = [
  {
    num: "01",
    title: "High-Performance Web",
    desc: "WordPress, Shopify, and custom React/Next.js builds tailored for rapid load times, conversion, and effortless scalability.",
  },
  {
    num: "02",
    title: "SEO, AEO & GEO",
    desc: "Dominate Google organic rankings and establish clear authority across AI search engines and generative platforms like ChatGPT, Google AI, Claude, Perplexity and more.",
  },
  {
    num: "03",
    title: "Lead Generation & Performance",
    desc: "Precision funnels, CRO, and targeted paid acquisition that systematically turns website traffic into qualified revenue.",
  },
  {
    num: "04",
    title: "Intelligent Workflows & AI",
    desc: "Modern AI integrations, custom automations, and intelligent tools designed to streamline business operations.",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Consult & Align",
    desc: "We dive deep into your brand, audience, and business goals on a discovery call, and map out a clear growth blueprint.",
  },
  {
    step: "02",
    title: "Craft & Execute",
    desc: "From clean code to conversion copy and campaign setup, our team executes with attention to detail and milestone updates.",
  },
  {
    step: "03",
    title: "Scale & Measure",
    desc: "We track every key metric with transparent weekly and monthly reporting, iterating continuously to maximise return.",
  },
];

/* ══════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════ */

const AboutPage = () => {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>About Us | Kola Communications</title>
        <meta
          name="description"
          content="Kola Communications is a Mumbai-based website development and digital marketing agency empowering brands across India, Australia, the US, the UK, and UAE."
        />
        <link rel="canonical" href="https://www.kolacommunications.com/about" />
      </Helmet>

      <CustomCursor />
      <ContactForm open={contactOpen} onClose={() => setContactOpen(false)} />

      <div className="relative overflow-hidden">
        <ColumnGuides />

        {/* WHO WE ARE — dedicated About page component */}
        <div className="pt-16 md:pt-24">
          <AboutPageHero />
        </div>

        <SectionDivider />

        {/* THE NUMBERS */}
        <section className="py-20 section-container p-6 md:p-10">
          <div className="max-w-[1080px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 text-center">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex flex-col items-center justify-center pt-5 text-center"
                >
                  <p className="text-[clamp(2.2rem,3.6vw,2.9rem)] font-semibold tracking-[-0.03em] leading-none text-center">
                    <AnimatedCounter
                      value={s.target}
                      prefix={s.prefix}
                      suffix={s.suffix}
                      decimals={s.decimals}
                    />
                  </p>
                  <p className="text-[15px] font-medium mt-3 text-center">{s.label}</p>
                  <p className="text-[13px] text-muted-foreground mt-0.5 text-center">
                    {s.sub}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* WHAT WE DO */}
        <section className="py-24 section-container p-6 md:pt-12 md:p-10">
          <div className="max-w-[1080px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-14 items-end mb-16">
              <AnimatedHeading
                lines={["What we do,", "engineered for impact."]}
                breakOnMobile={false}
                className="text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05] tracking-[-0.02em]"
              />
            </div>

            {/* Capabilities cards with rounded-xl and equal gap */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {capabilities.map((cap, i) => (
                <motion.div
                  key={cap.num}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 transition-all duration-300 hover:border-foreground/25 hover:shadow-sm"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none select-none absolute -top-2 right-4 text-[64px] font-bold leading-none tracking-[-0.04em] text-foreground/[0.06] transition-colors duration-300 group-hover:text-foreground/[0.1]"
                  >
                    {cap.num}
                  </span>
                  <h3 className="relative text-[19px] font-semibold tracking-[-0.01em] mb-2.5">
                    {cap.title}
                  </h3>
                  <p className="text-[15px] text-muted-foreground leading-[1.6]">
                    {cap.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* HOW WE WORK */}
        <section className="py-24 section-container p-6 md:p-10">
          <div className="max-w-[1080px] mx-auto">
            <AnimatedHeading
              lines={["How we work,", "start to scale."]}
              breakOnMobile={false}
              className="text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05] tracking-[-0.02em] mb-4"
            />
            

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
              {processSteps.map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className=" pt-6"
                >
                  <h3 className="text-[19px] font-semibold tracking-[-0.01em] mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-[15px] text-muted-foreground leading-[1.6]">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <TestimonialBanner />

        {/* CTA */}
        <section className="py-20 border-t border-border section-container p-6 md:p-10">
          <div className="max-w-[1080px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
             
              <AnimatedHeading
                lines={["Ready to elevate", "your digital presence?"]}
                className="text-[clamp(1.9rem,4vw,3rem)] leading-[1.05] tracking-[-0.02em]"
              />
            </div>

            <button
              onClick={() => setContactOpen(true)}
              className="
                group inline-flex items-center gap-2.5 shrink-0
                bg-black text-white dark:bg-white dark:text-black
                pl-6 pr-2 py-2 rounded-full
                text-sm font-medium
                shadow-[0_4px_20px_rgba(0,0,0,0.1)]
                hover:opacity-90 transition-opacity
              "
            >
              <span>Schedule a Discovery Call</span>
              <span className="w-7 h-7 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                <ArrowUpRight size={14} />
              </span>
            </button>
          </div>
        </section>
      </div>

      <CTAFooter />
    </div>
  );
};

export default AboutPage;
