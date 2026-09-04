import { motion, AnimatePresence } from "framer-motion";
import { useState, memo, useCallback } from "react";
import { Plus } from "lucide-react";

/* ---------------- DATA ---------------- */

import {
  SiWordpress,
  SiShopify,
  SiWebflow,
  SiFramer,
  SiWoocommerce,
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiJavascript,
  SiTailwindcss,
  SiNodedotjs,
  SiPostgresql,
  SiSupabase,
  SiVercel,
  SiGithub,
  SiCloudflare,
  SiFigma,
  SiCanva,
  SiGoogleanalytics,
  SiGoogleads,
  SiGoogletagmanager,
  SiGooglesearchconsole,
  SiSemrush,
  SiHubspot,
  SiMeta,
  SiZapier,
  SiPython,
} from "react-icons/si";

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
  { icon: SiPostgresql, name: "PostgreSQL" },
  { icon: SiSupabase, name: "Supabase" },
  { icon: SiVercel, name: "Vercel" },
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
  { icon: SiPython, name: "Python" },
];

const services = [
  {
    icon: "https://cdn-icons-png.flaticon.com/512/1006/1006771.png",
    title: "Website Development",
    desc: "We build websites that load fast, rank well and convert visitors into customers. Whether that means a custom-coded platform, a WordPress site or a Shopify store, every build is designed around your business goals, not a template. Speed, structure and search visibility are built in from day one.",
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/2956/2956744.png",
    title: "SEO, AEO & GEO",
    desc: "Search is no longer just Google. We optimise your brand for traditional search, AI answer engines and generative search results, so you show up wherever your customers are looking. Technical SEO, structured content and ongoing optimisation keep you visible as search itself evolves.",
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/8637/8637099.png",
    title: "AI-Powered Tools & Applications",
    desc: "We turn AI ideas into working products. From internal tools that save your team hours to customer-facing applications, we build with secure integrations, clean data handling and dashboards that show real impact, not just a demo that looks good once.",
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/3135/3135706.png",
    title: "Lead Generation & Conversion",
    desc: "Traffic without conversion is wasted spend. We build landing pages, forms and follow-up systems designed to turn visitors into qualified leads. Every funnel is tested and refined against real numbers, so your cost per lead keeps dropping while quality goes up.",
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/733/733547.png",
    title: "Social Media Marketing",
    desc: "We manage social media like a growth channel, not a checklist. Strategy, content and community management work together to build an audience that actually engages with your brand, not one that just scrolls past it. Consistency and creativity drive every post.",
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/4697/4697143.png",
    title: "Content Creation & Strategy",
    desc: "Good content starts with what your audience is searching for, not what is easy to write. We plan and create blog posts, campaigns and website copy built around real search intent and genuine business goals, so every piece works toward a result.",
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/3281/3281289.png",
    title: "Brand Identity & Design",
    desc: "Your brand is more than a logo. We build complete visual identities, from logo and colour systems to tone of voice, so your business looks consistent and credible everywhere it shows up. A strong identity is what makes people remember you.",
  },
  {
    icon: "https://cdn-icons-png.flaticon.com/512/2920/2920277.png",
    title: "Performance Marketing",
    desc: "We run paid campaigns on Google, Meta and LinkedIn built around results you can measure, not impressions that look nice in a report. Creative, targeting and budget are optimised continuously, so every rupee spent works toward qualified leads.",
  },
];

/* ---------------- TECH ICON ITEM ---------------- */
const TechIcon = memo(({ icon: Icon, name }: { icon: typeof SiWordpress; name: string }) => (
  <div className="relative group">
    <div
      className="
        w-11 h-11
        rounded-xl
        border border-black/10
        bg-white
        flex items-center justify-center
        shadow-[0_1px_4px_rgba(0,0,0,0.04)]
        transition-transform duration-200
        group-hover:scale-105 group-hover:-translate-y-0.5
      "
    >
      <Icon size={18} className="text-black/80 group-hover:text-black transition-colors" />
    </div>

    {/* TOOLTIP */}
    <div
      className="
        pointer-events-none
        absolute bottom-full left-1/2 -translate-x-1/2 mb-2
        px-2.5 py-1
        text-[11px] font-medium
        rounded-md
        bg-black text-white
        whitespace-nowrap
        opacity-0 scale-95
        group-hover:opacity-100 group-hover:scale-100
        transition-all duration-150 ease-out z-20
      "
    >
      {name}
    </div>
  </div>
));

/* ---------------- SERVICE ROW ---------------- */
interface ServiceRowProps {
  service: (typeof services)[0];
  isOpen: boolean;
  onToggle: () => void;
}

const ServiceRow = memo(({ service, isOpen, onToggle }: ServiceRowProps) => (
  <div>
    {/* ROW */}
    <div
      onClick={onToggle}
      className="flex items-center justify-between group cursor-pointer select-none py-1"
    >
      {/* LEFT CONTENT */}
      <div className="flex items-center gap-4">
        {/* ICON */}
        <div
          className="
            w-11 h-11 rounded-full
            flex items-center justify-center
            bg-black text-white grayscale
            shadow-lg shrink-0
          "
        >
          <img
            src={service.icon}
            alt={service.title}
            width={20}
            height={20}
            loading="lazy"
            decoding="async"
            className="w-5 h-5 invert"
          />
        </div>

        {/* TEXT */}
        <span className="text-lg font-medium group-hover:text-black/75 transition-colors">
          {service.title}
        </span>
      </div>

      {/* PLUS BUTTON */}
      <motion.button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        whileTap={{ scale: 0.9 }}
        className="
          w-8 h-8 rounded-full
          border border-black/15
          flex items-center justify-center
          hover:bg-black/[0.05] transition-colors
        "
        aria-label={`Toggle ${service.title}`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <Plus size={16} />
        </motion.div>
      </motion.button>
    </div>

    {/* EXPAND TEXT */}
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden pl-[60px] pr-4 text-md text-muted-foreground mt-2"
        >
          <p className="pb-2">{service.desc}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
));

/* ---------------- COMPONENT ---------------- */

const ServicesSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = useCallback((i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  }, []);

  return (
    <section id="services" className="min-h-[90vh] flex items-center py-12 content-visibility-auto">
      <div className="section-container w-full p-4 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
          {/* ================= LEFT COLUMN (Sticky) ================= */}
          <div className="lg:sticky lg:top-32 space-y-8">
            <h2 className="text-[clamp(2.2rem,4vw,3.2rem)] leading-[1.05] tracking-[-0.02em] mb-12 md:mb-16">
              <span className="text-muted-foreground font-medium">Services that </span>
              <span className="text-foreground font-semibold">supercharge your business.</span>
            </h2>

            {/* TECH STACK */}
            <motion.div
              className="flex flex-wrap gap-3 mt-10"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {techStack.map((tech) => (
                <TechIcon key={tech.name} icon={tech.icon} name={tech.name} />
              ))}
            </motion.div>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="flex flex-col gap-6">
            {services.map((service, i) => (
              <ServiceRow
                key={service.title}
                service={service}
                isOpen={openIndex === i}
                onToggle={() => handleToggle(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(ServicesSection);

