import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Plus, ArrowUpRight, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const aboutImage =
  "https://framerusercontent.com/images/mgRdbBZJGPn94ft58M4tL0u810.jpg?scale-down-to=1024";

const socials = [
  {
    icon: Instagram,
    href: "https://www.instagram.com/p/DG5c5GTPtgh/",
  },
  {
    icon: Linkedin,
    href: "https://in.linkedin.com/company/kolacommunications",
  },
];

/* ---------------- DATA ---------------- */

const values = [
  {
    title: "Results Driven",
    text: "We focus on delivering measurable outcomes that directly impact your business growth and success.",
  },
  {
    title: "Innovation First",
    text: "We stay ahead of digital trends and leverage cutting edge technologies to give you a competitive edge.",
  },
  {
    title: "Client Centric",
    text: "Your success is our priority. We build lasting partnerships through transparent communication and dedicated support.",
  },
  {
    title: "Quality Excellence",
    text: "We maintain the highest standards in every project, ensuring exceptional quality and attention to detail.",
  },
];

/* The three original paragraphs, condensed to the one the layout has
   room for: where the agency came from, what it does now, and the habit
   it credits for keeping clients. */
const paragraphs = [
  "Kola Communications was built on one belief: every business, whatever its size, deserves a powerful digital presence. What started as a passion for solving problems creatively has grown into a full-service digital agency trusted by brands across India, Australia, the US, Europe and the Middle East.",
  "We go beyond aesthetics: from high-performance websites to targeted SEO and lead generation, everything we build is designed to deliver measurable impact. We’re detail-obsessed, and we think that’s exactly what sets us apart.",
];

/* ---------------- COMPONENT ---------------- */

const AboutSection = () => {
  // Any number of values can be open at once — reading one is not a reason
  // to close another.
  const [open, setOpen] = useState<string[]>([]);

  const toggle = (title: string) =>
    setOpen((current) =>
      current.includes(title)
        ? current.filter((t) => t !== title)
        : [...current, title]
    );

  return (
    <section
      id="about"
      className="py-12 border-t border-border section-container px-6 md:px-10"
    >
      <div className="mx-auto max-w-[1080px]">
        <h2 className="text-[clamp(2.2rem,4vw,3.2rem)] leading-[1.05] tracking-[-0.02em] mb-12 md:mb-16 max-w-[820px]">
          <span className="text-muted-foreground font-medium">Helping brands grow in a </span>
          <span className="text-foreground font-semibold">digital-first world.</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-14 items-stretch">
          {/* ================= IMAGE =================
              No fixed aspect ratio: the frame stretches to the row, so it
              always ends level with the copy beside it — including as the
              values open and close and the column grows. The photograph
              eases in a little at the same time, so the extra height reads
              as intentional rather than as the frame merely getting taller. */}
          <div className="relative w-full h-full min-h-[360px] lg:min-h-[520px] rounded-xl overflow-hidden">
            <img
              src={aboutImage}
              alt="The Kola Communications team at work"
              className="w-full h-full object-cover transition-transform duration-500 ease-out"
              style={{ transform: open.length ? "scale(1.06)" : "scale(1)" }}
              loading="lazy"
              decoding="async"
            />

            {/* SOCIAL BAR OVER IMAGE */}
            <div className="absolute bottom-4 left-4 flex gap-2 z-10">
              {socials.map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    w-8 h-8 rounded-full
                    bg-black/70 backdrop-blur-md
                    flex items-center justify-center
                    text-white
                    transition-all duration-300
                    hover:scale-110 hover:bg-black
                  "
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* ================= COPY ================= */}
          <div>
            <div className="space-y-4 text-lg text-muted-foreground leading-[1.65] mb-8">
              {paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* ===== VALUES ===== */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mb-6">
              {values.map((value) => {
                const expanded = open.includes(value.title);
                const panelId = `about-value-${value.title
                  .toLowerCase()
                  .replace(/[^a-z]+/g, "-")}`;

                return (
                  <li
                    key={value.title}
                    className="border-t border-border first:border-t sm:[&:nth-child(2)]:border-t"
                  >
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      onClick={() => toggle(value.title)}
                      className="w-full flex items-center gap-3 py-3.5 text-left"
                    >
                      <motion.span
                        animate={{ rotate: expanded ? 45 : 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="
                          shrink-0 w-6 h-6 rounded-full
                          border border-border
                          flex items-center justify-center
                          text-muted-foreground
                        "
                      >
                        <Plus size={13} />
                      </motion.span>
                      <span className="text-[15px] font-medium">
                        {value.title}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div
                          id={panelId}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="pb-4 pl-9 pr-2 text-[14px] leading-[1.6] text-muted-foreground">
                            {value.text}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>

            {/* The short version lives here; the full story is its own page. */}
            <Link
              to="/about"
              className="
                group inline-flex items-center gap-2
                rounded-full bg-foreground text-background
                px-5 py-2.5 text-[15px] font-medium
                hover:opacity-90 transition-opacity
              "
            >
              About us
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
