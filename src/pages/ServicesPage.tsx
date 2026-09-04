import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Plus,
  Minus,
  Code2,
  Search,
  Target,
  Palette,
  BarChart3,
  Share2,
  FileText,
  Cpu,
} from "lucide-react";
import { Link } from "react-router-dom";

import ColumnGuides from "@/components/ColumnGuides";
import CustomCursor from "@/components/CustomCursor";
import AnimatedHeading from "@/components/AnimatedHeading";
import TestimonialBanner from "@/components/TestimonialBanner";
import CTAFooter from "@/components/CTAFooter";
import ContactForm from "@/components/ContactForm";

import {
  SiWordpress,
  SiShopify,
  SiReact,
  SiTailwindcss,
  SiGithub,
  SiGoogleanalytics,
  SiMeta,
  SiOpenai,
  SiPython,
  SiJavascript,
  SiTypescript,
  SiNextdotjs,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiPostgresql,
  SiSupabase,
  SiFirebase,
  SiVercel,
  SiNetlify,
  SiFigma,
  SiCanva,
  SiWebflow,
  SiFramer,
  SiWoocommerce,
  SiCloudflare,
  SiGoogleads,
  SiGoogletagmanager,
  SiGooglesearchconsole,
  SiSemrush,
  SiHubspot,
  SiZapier,
} from "react-icons/si";

/* ══════════════════════════════════════════
   DETAILED SERVICES DATA
   ══════════════════════════════════════════ */

const detailedServices = [
  {
    id: "web-dev",
    icon: Code2,
    num: "01",
    title: "Website Development",
    tagline: "High-speed, SEO-engineered digital platforms.",
    desc: "We engineer lightning-fast, conversion-focused websites that position your brand as a market leader. Whether you require a custom WordPress theme, an optimized Shopify store, or a bespoke React / Next.js web application, our builds prioritize performance, clean code, and zero technical debt.",
    deliverables: [
      "Custom WordPress & WooCommerce Development",
      "Shopify & Shopify Plus Store Architecture",
      "Headless CMS & Full-Stack React / Next.js",
      "Mobile-First & 90+ Core Web Vitals Optimization",
      "Seamless API, CRM & Payment Gateway Integrations",
    ],
    tech: ["WordPress", "Shopify", "React", "Next.js", "TypeScript", "Tailwind"],
  },
  {
    id: "seo-aeo",
    icon: Search,
    num: "02",
    title: "SEO, AEO & GEO",
    tagline: "Own search rankings across Google and AI search engines.",
    desc: "Search is evolving rapidly. We optimize your digital presence not only for traditional search engines like Google and Bing, but also for generative AI answer engines (ChatGPT, Perplexity, Google Gemini). We build enduring organic authority that turns searchers into qualified buyers.",
    deliverables: [
      "Technical SEO Audits & Core Web Vitals Remediation",
      "Answer & Generative Engine Optimization (AEO & GEO) for LLMs & AI Search",
      "High-Intent Keyword Strategy & Content Topic Clusters",
      "Structured Schema Markup & Rich Snippet Engineering",
      "High-Quality White-Hat Editorial Link Acquisition",
    ],
    tech: ["Google Search Console", "Ahrefs", "Semrush", "Schema.org", "Analytics"],
  },
  {
    id: "lead-gen",
    icon: Target,
    num: "03",
    title: "Lead Generation & Conversion Funnels",
    tagline: "Systematized pipelines that turn traffic into revenue.",
    desc: "Traffic is meaningless without conversion. We construct multi-step lead generation funnels, high-converting landing pages, and automated nurture sequences that capture high-intent prospects and deliver sales-ready leads straight into your CRM.",
    deliverables: [
      "High-Converting Landing Page Design & Copywriting",
      "Multi-Step Lead Qualification Funnels",
      "Conversion Rate Optimization (CRO) & A/B Split Testing",
      "Automated Email Nurture & Lead Scoring Workflows",
      "Real-Time CRM & Webhook Integrations (HubSpot, Zapier)",
    ],
    tech: ["Figma", "Next.js", "HubSpot", "Zapier", "Analytics"],
  },
  {
    id: "brand-identity",
    icon: Palette,
    num: "04",
    title: "Brand Identity & Visual Design",
    tagline: "Memorable design systems that command authority and trust.",
    desc: "We define brand aesthetics that captivate modern audiences. From cohesive design systems and visual identity to comprehensive UI/UX guidelines and marketing collateral, we ensure every touchpoint conveys premium quality and credibility.",
    deliverables: [
      "Complete Visual Brand Identity & Logo Systems",
      "Design Systems & Component Libraries in Figma",
      "UI/UX Architecture for Web and Mobile Interfaces",
      "Brand Guidelines (Typography, Color Palettes, Imagery)",
      "Digital Marketing Assets & Pitch Deck Presentations",
    ],
    tech: ["Figma", "Canva", "Adobe Suite", "Design Tokens"],
  },
  {
    id: "performance-marketing",
    icon: BarChart3,
    num: "05",
    title: "Performance Marketing & Paid Ads",
    tagline: "ROI-driven acquisition campaigns tuned for maximum ROAS.",
    desc: "Stop burning ad budget on vanity impressions. We structure, manage, and scale data-backed paid advertising campaigns across Meta Ads, Google Ads, and LinkedIn with relentless focus on customer acquisition cost (CAC) and verified ROAS.",
    deliverables: [
      "Full-Funnel Meta Ads (Facebook & Instagram) Management",
      "Google Search, Performance Max & Shopping Campaigns",
      "Retargeting & Dynamic Audience Segmentation",
      "Creative Ad Copywriting & High-Converting Ad Formats",
      "Transparent Real-Time ROAS & CPA Dashboard Reporting",
    ],
    tech: ["Meta Ads Manager", "Google Ads", "GA4", "Looker Studio"],
  },
  {
    id: "social-media",
    icon: Share2,
    num: "06",
    title: "Social Media Marketing",
    tagline: "Build a loyal, engaged community around your brand.",
    desc: "We turn social channels into brand growth engines. Our content strategy, video reel concepts, and community engagement tactics ensure your brand stays top-of-mind and builds compounding social proof.",
    deliverables: [
      "Cross-Platform Social Media Strategy & Positioning",
      "Monthly Content Calendars (Reels, Carousels, Stories)",
      "Creative Copywriting & Graphic Design Production",
      "Community Engagement & Direct Message Lead Capture",
      "Monthly Performance Analytics & Trend Adaptation",
    ],
    tech: ["Instagram", "LinkedIn", "Meta Suite", "Canva", "Figma"],
  },
  {
    id: "content-strategy",
    icon: FileText,
    num: "07",
    title: "Content Creation & Strategy",
    tagline: "Authority-building editorial that ranks and converts.",
    desc: "Content is the bedrock of modern digital authority. We write compelling, deeply researched editorial pieces, case studies, and website copy that educates your prospective buyers and solidifies your market dominance.",
    deliverables: [
      "SEO-Optimized Pillar Articles & Thought Leadership",
      "Website Copywriting & Conversion Sales Pages",
      "Case Studies & Customer Success Story Production",
      "Email Marketing Newsletters & Campaign Sequences",
      "Content Distribution & Multi-Channel Repurposing",
    ],
    tech: ["SEO Copy", "Markdown", "WordPress CMS", "Grammarly"],
  },
  {
    id: "ai-tools",
    icon: Cpu,
    num: "08",
    title: "AI-Powered Tools & Intelligent Workflows",
    tagline: "Automate operations and build smart digital tools.",
    desc: "Leverage the power of generative AI to work smarter. We build custom conversational AI chatbots, internal process automations, and intelligent tools that eliminate manual tasks and provide seamless 24/7 client interactions.",
    deliverables: [
      "Custom AI Chatbots & Customer Support Assistants",
      "Intelligent Lead Qualification & Automated Routing",
      "Workflow Automations with OpenAI & Python Backends",
      "Bespoke Internal Web Tools & Data Scraping Pipelines",
      "AI Prompt Engineering & Team Workflow Integrations",
    ],
    tech: ["OpenAI", "Python", "Node.js", "Supabase", "FastAPI"],
  },
];

const techStack = [
  { icon: SiWordpress, name: "WordPress" },
  { icon: SiShopify, name: "Shopify" },
  { icon: SiWebflow, name: "Webflow" },
  { icon: SiFramer, name: "Framer" },
  { icon: SiWoocommerce, name: "WooCommerce" },
  { icon: SiReact, name: "React" },
  { icon: SiNextdotjs, name: "Next.js" },
  { icon: SiTypescript, name: "TypeScript" },
  { icon: SiJavascript, name: "JavaScript" },
  { icon: SiTailwindcss, name: "Tailwind" },
  { icon: SiNodedotjs, name: "Node.js" },
  { icon: SiExpress, name: "Express" },
  { icon: SiMongodb, name: "MongoDB" },
  { icon: SiPostgresql, name: "PostgreSQL" },
  { icon: SiSupabase, name: "Supabase" },
  { icon: SiFirebase, name: "Firebase" },
  { icon: SiVercel, name: "Vercel" },
  { icon: SiNetlify, name: "Netlify" },
  { icon: SiGithub, name: "GitHub" },
  { icon: SiCloudflare, name: "Cloudflare" },
  { icon: SiFigma, name: "Figma" },
  { icon: SiCanva, name: "Canva" },
  { icon: SiGoogleanalytics, name: "Analytics" },
  { icon: SiGoogleads, name: "Google Ads" },
  { icon: SiGoogletagmanager, name: "Tag Manager" },
  { icon: SiGooglesearchconsole, name: "Search Console" },
  { icon: SiSemrush, name: "Semrush" },
  { icon: SiHubspot, name: "HubSpot" },
  { icon: SiMeta, name: "Meta Ads" },
  { icon: SiZapier, name: "Zapier" },
  { icon: SiOpenai, name: "ChatGPT / AI" },
  { icon: SiPython, name: "Python" },
];


const serviceFaqs = [
  {
    q: "How do we choose between a monthly retainer and a one-time project?",
    a: "If you have a defined deliverable with fixed scope (such as a new website build or a brand identity redesign), a One-Time Project is ideal. For ongoing growth, SEO, paid ads, continuous CRO, and dedicated support, our Monthly Retainer gives you a fully managed team at predictable rates.",
  },
  {
    q: "How long does a typical website development project take?",
    a: "Standard WordPress or Shopify builds take between 3 to 5 weeks from discovery to deployment. Custom React / Next.js applications and large eCommerce platforms typically take 6 to 8 weeks depending on complexity.",
  },
  {
    q: "Will we own all the code and digital assets after completion?",
    a: "Yes, 100%. Upon completion and final handover, you receive full administrative ownership of your repository, website hosting, CMS credentials, and design files with zero lock-in.",
  },
  {
    q: "Do you sign Non-Disclosure Agreements (NDAs)?",
    a: "Yes. We respect client confidentiality and regularly sign mutual NDAs before reviewing sensitive business data or project requirements.",
  },
];

/* ══════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════ */

const ServicesPage = () => {
  const [contactOpen, setContactOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Services | Kola Communications — Website & Digital Marketing Agency</title>
        <meta
          name="description"
          content="Explore Kola Communications' full suite of digital marketing and web development services: WordPress, Shopify, Custom Next.js, SEO, AEO & GEO, Lead Generation, and AI Tools."
        />
        <link rel="canonical" href="https://www.kolacommunications.com/services" />
      </Helmet>

      <CustomCursor />
      <ContactForm open={contactOpen} onClose={() => setContactOpen(false)} />

      <div className="relative overflow-hidden">
        <ColumnGuides />

        {/* ══════════════════════════════════════════
            HERO SECTION
           ══════════════════════════════════════════ */}
        <section className="pt-36 pb-16 md:pt-44 md:pb-24 section-container px-6 md:px-10">
          <div className="max-w-[1080px] mx-auto">
            {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-muted/60 backdrop-blur-md text-xs font-medium mb-8">
              <Sparkles size={13} className="text-primary" />
              <span>Full-Spectrum Digital Services</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Built for Growth</span>
            </div> */}

            <AnimatedHeading
              lines={["Services that supercharge", "your business growth."]}
              className="
                hidden md:block
                text-[clamp(2.6rem,5vw,4.2rem)]
                leading-[1.05]
                tracking-[-0.025em]
                max-w-[850px]
                mb-6
              "
            />
            <AnimatedHeading
              lines={["Services that", "supercharge your", "business growth."]}
              className="
                md:hidden
                text-[clamp(2.4rem,6vw,3.5rem)]
                leading-[1.08]
                tracking-[-0.025em]
                mb-6
              "
            />

            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-start pt-4 ">
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                From websites that convert and social content that builds an audience, to search supremacy across SEO, AEO & GEO and bespoke AI tools, everything we engineer is designed to deliver measurable commercial returns.
              </p>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                <button
                  onClick={() => setContactOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-black text-white px-7 py-3.5 text-sm font-medium hover:opacity-90 transition shadow-md"
                >
                  <Calendar size={16} />
                  Book a Free Strategy Call
                </button>
                <Link
                  to="/projects"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white text-black px-7 py-3.5 text-sm font-medium hover:bg-muted transition"
                >
                  Explore Our Work
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            DEEP-DIVE SERVICES GRID
           ══════════════════════════════════════════ */}
        <section className="py-20 border-t border-border bg-[#fafafa]">
          <div className="max-w-[1080px] mx-auto px-6 md:px-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <AnimatedHeading
                lines={["Engineered for", "end-to-end execution."]}
                className="text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05] tracking-[-0.02em]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {detailedServices.map((service) => {
                const Icon = service.icon;
                return (
                  <div
                    key={service.id}
                    className="p-8 md:p-10 rounded-3xl border border-border bg-white shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:border-black/30 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
                          <Icon size={22} />
                        </div>
                        <span className="text-xs font-mono font-bold text-muted-foreground">
                          {service.num}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                      <p className="text-xs font-medium text-muted-foreground mb-4">
                        {service.tagline}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                        {service.desc}
                      </p>

                      <div className="space-y-2.5 mb-8">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
                          Key Deliverables:
                        </p>
                        {service.deliverables.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                            <CheckCircle2 size={15} className="text-black/60 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-5 border-t border-gray-100 flex flex-wrap gap-1.5">
                      {service.tech.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            INTERACTIVE TECH STACK
           ══════════════════════════════════════════ */}
        <section className="py-24 section-container px-6 md:px-10">
          <div className="max-w-[1080px] mx-auto text-center">

            <AnimatedHeading
              lines={["Technologies we build", "and scale with."]}
              className="text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05] tracking-[-0.02em] mb-12"
            />

            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
              {techStack.map(({ icon: Icon, name }) => (
                <div
                  key={name}
                  className="
                    flex items-center gap-2.5 px-4 py-2.5 rounded-xl
                    border border-border bg-card
                    shadow-[0_2px_8px_rgba(0,0,0,0.04)]
                    hover:scale-105 hover:border-black/30 transition-all cursor-default
                  "
                >
                  <Icon size={16} className="text-foreground" />
                  <span className="text-xs font-semibold">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            ENGAGEMENT MODELS (FROM PRICING)
           ══════════════════════════════════════════ */}
        <section className="py-20 border-t border-border bg-[#fafafa]">
          <div className="max-w-[1080px] mx-auto px-6 md:px-10">
            <div className="text-center max-w-2xl mx-auto mb-16">

              <AnimatedHeading
                lines={["Transparent ways", "to collaborate."]}
                className="text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05] tracking-[-0.02em]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Retainer Card */}
              <div className="p-8 md:p-10 rounded-3xl border border-border bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Continuous Scaling
                    </span>
                    <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Monthly Growth Retainer</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    A fully managed monthly engagement covering strategy, execution and reporting, so you can focus on running your business.
                  </p>

                  <div className="space-y-3 mb-8">
                    {[
                      "Dedicated account manager & weekly sprints",
                      "Full-stack web maintenance & CRO tuning",
                      "SEO, AEO & GEO for Google and AI search engines",
                      "Paid ads structuring & ROAS scaling",
                      "Monthly executive analytics reports",
                    ].map((f, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-foreground">
                        <CheckCircle2 size={16} className="text-black/60 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setContactOpen(true)}
                  className="w-full py-3.5 bg-black text-white rounded-full text-sm font-medium hover:opacity-90 transition shadow-md"
                >
                  Inquire for Retainer
                </button>
              </div>

              {/* One-Time Project */}
              <div className="p-8 md:p-10 rounded-3xl border border-border bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Fixed Scope
                    </span>
                    <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                      Milestone Based
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">One-Time Project</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    End-to-end execution for a specific website redesign, eCommerce migration, brand launch, or AI workflow. Ideal for businesses with a defined timeline and scope.
                  </p>

                  <div className="space-y-3 mb-8">
                    {[
                      "Clearly defined scope & fixed timeline",
                      "Dedicated project manager & milestone reviews",
                      "Complete code ownership, zero lock-in",
                      "Post-launch 30-day warranty & training",
                      "Strict adherence to budgets & deliverables",
                    ].map((f, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-foreground">
                        <CheckCircle2 size={16} className="text-black/60 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setContactOpen(true)}
                  className="w-full py-3.5 border border-border bg-white text-black rounded-full text-sm font-medium hover:bg-muted transition"
                >
                  Request Project Proposal
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            TESTIMONIAL BANNER
           ══════════════════════════════════════════ */}
        <TestimonialBanner />

        {/* ══════════════════════════════════════════
            SERVICES FAQ ACCORDION
           ══════════════════════════════════════════ */}
        <section className="py-24 section-container px-6 md:px-10">
          <div className="max-w-[900px] mx-auto">
            <div className="text-center max-w-xl mx-auto mb-14">

              <AnimatedHeading
                lines={["Frequently Asked", "Questions."]}
                className="text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05] tracking-[-0.02em]"
              />
            </div>

            <div className="space-y-3">
              {serviceFaqs.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className={`rounded-2xl border transition-all ${
                      isOpen
                        ? "border-gray-300 bg-[#f8f8f8]"
                        : "border-border bg-card hover:bg-muted/40"
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold"
                    >
                      <span>{faq.q}</span>
                      <div className="w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center shrink-0 ml-4">
                        {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                      </div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-5 text-xs md:text-sm text-muted-foreground leading-relaxed">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FINAL CTA
           ══════════════════════════════════════════ */}
        <section className="py-16 border-t border-border text-black">
          <div className="max-w-[1080px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>

              <AnimatedHeading
                lines={["Ready to supercharge", "your digital growth?"]}
                className="text-[clamp(1.9rem,4vw,3rem)] leading-[1.05] tracking-[-0.02em]"
              />
            </div>
            <button
              onClick={() => setContactOpen(true)}
              className="rounded-full bg-black text-white px-8 py-3.5 text-sm font-medium hover:opacity-90 transition whitespace-nowrap shadow-md"
            >
              Schedule a Discovery Call
            </button>
          </div>
        </section>
      </div>

      <CTAFooter />
    </div>
  );
};

export default ServicesPage;
