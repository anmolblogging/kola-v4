import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Instagram,
  Linkedin,
  ChevronDown,
} from "lucide-react";
import AnimatedHeading from "@/components/AnimatedHeading";

const avatarJoseph = "https://framerusercontent.com/images/mgRdbBZJGPn94ft58M4tL0u810.jpg?scale-down-to=1024";

/* ---------------- DATA ---------------- */

const paragraphs = [
  {
    bold: "Kola Communications started with a small team and one simple observation:",
    text: "most digital marketing looked impressive in a pitch deck but rarely moved the needle where it actually mattered. We set out to build something different, an agency that treats every website, campaign and piece of content as a business investment, not a checkbox. Today we work with brands across India, Australia, the US, Europe and the Middle East.",
  },
  {
    bold: "Our work spans web development, social media marketing, SEO, AEO and GEO, paid media, content and AI-powered tools, but our focus never shifts.",
    text: "Every project starts with a clear goal and ends with a result we can point to. Design, data and strategy come together so nothing we build is just decoration, it is built to perform.",
  },
  {
    bold: "We care about the details most agencies skip:",
    text: "how a page loads on a slow connection, how a headline reads on a phone screen, how a campaign performs in week eight, not just week one. That care is what keeps our clients with us long after the first project ends.",
  },
];

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

const history = [
  {
    company: "Results-Driven",
    role: "We focus on delivering measurable outcomes that directly impact your business growth and success.",
  },
  {
    company: "Innovation First",
    role: "We stay ahead of digital trends and leverage cutting-edge technologies to give you a competitive edge.",
  },
  {
    company: "Client-Centric",
    role: "Your success is our priority. We build lasting partnerships through transparent communication and dedicated support.",
  },
  {
    company: "Quality Excellence",
    role: "We maintain the highest standards in every project, ensuring exceptional quality and attention to detail.",
  },
];

/* ---------------- COMPONENT ---------------- */

const AboutPageHero = () => {
  const [open, setOpen] = useState(false);

  return (
    <section className="py-24 md:py-32 border-t border-border section-container px-6 md:px-10">
      <div className="mx-auto max-w-[1080px]">
        {/* ===== HEADING ===== */}
        <AnimatedHeading
          lines={["Our story, our team,", "our obsession with results."]}
          className="
            hidden md:block
            text-[clamp(2.6rem,5vw,4rem)]
            leading-[1.05]
            tracking-[-0.025em]
            mb-20 md:mb-24
            max-w-[760px]
          "
        />
        <AnimatedHeading
          lines={["Our story, our team,", "our obsession with results."]}
          className="
            md:hidden
            text-[clamp(2.15rem,7vw,2.6rem)]
            leading-[1.05]
            tracking-[-0.03em]
            mb-20 md:mb-24
            max-w-[760px]
          "
        />

        {/* ===== GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-16 ">
          {/* ================= LEFT ================= */}
          <div>
            {/* IMAGE */}
            <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-2xl overflow-hidden">
              <img
                src={avatarJoseph}
                alt="Kola Communications"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                width={420}
                height={525}
              />

              {/* SOCIAL BAR */}
              <div className="absolute bottom-4 left-4 flex gap-2">
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

            {/* NAME */}
            <div className="mt-6">
              <h3 className="text-[17px] font-semibold">Kola Communications</h3>
              <p className="text-[13px] text-muted-foreground">
                Digital Marketing Agency
              </p>
            </div>

            {/* ===== PARAGRAPHS — mobile only, shown between image and values ===== */}
            <div className="lg:hidden mt-10 space-y-8">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-[17px] leading-[1.65]">
                  <span className="font-medium">{p.bold}</span>{" "}
                  <span className="text-muted-foreground">{p.text}</span>
                </p>
              ))}
            </div>

            {/* ===== WORK HISTORY ===== */}
            <div className="mt-14">
              <p className="text-[15px] font-medium mb-6">
                Built on unshakeable values
              </p>

              <div className="max-w-[420px]">
                {/* STACK CARD */}
                <motion.div
                  layout
                  onClick={() => setOpen((prev) => !prev)}
                  className="relative cursor-pointer"
                >
                  {!open && (
                    <>
                      <div className="absolute inset-0 translate-y-3 scale-[0.96] bg-card border rounded-2xl opacity-40" />
                      <div className="absolute inset-0 translate-y-1.5 scale-[0.98] bg-card border rounded-2xl opacity-70" />
                    </>
                  )}

                  <motion.div
                    layout
                    className="
                      relative rounded-2xl border border-border bg-card
                      px-6 py-5
                      shadow-[0_8px_30px_rgba(0,0,0,0.08)]
                    "
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[16px] font-semibold">
                          {history[0].company}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {history[0].role}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* EXPANDED */}
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.25 }}
                      className="mt-3 flex flex-col gap-3"
                    >
                      {history.slice(1).map((item, i) => (
                        <motion.div
                          key={item.company}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: i * 0.05,
                            type: "spring",
                            stiffness: 120,
                            damping: 16,
                          }}
                          className="
                            rounded-2xl border border-border bg-card
                            px-6 py-5
                            shadow-[0_6px_20px_rgba(0,0,0,0.06)]
                          "
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-[15px] font-medium">
                                {item.company}
                              </p>
                              <p className="text-[13px] text-muted-foreground mt-1">
                                {item.role}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* BUTTON */}
                <motion.button
                  onClick={() => setOpen((prev) => !prev)}
                  initial="rest"
                  animate="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className="
                    mt-6 mx-auto flex items-center gap-2
                    px-5 py-2.5 rounded-full
                    text-[13px] font-medium
                    border border-white/20
                    bg-white/10
                    backdrop-blur-xl
                    shadow-[0_6px_30px_rgba(0,0,0,0.12)]
                    transition
                  "
                >
                  {/* TEXT */}
                  <motion.span
                    key={open ? "hide" : "show"}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-black"
                  >
                    {open ? "Hide" : "Show all"}
                  </motion.span>

                  {/* ICON */}
                  <motion.span
                    variants={{
                      rest: { rotate: 0 },
                      hover: { rotate: 180 },
                      tap: { scale: 0.9 },
                    }}
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex items-center justify-center text-black/70"
                  >
                    <ChevronDown size={16} />
                  </motion.span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* ================= RIGHT ================= */}
          {/* hidden on mobile since paragraphs are rendered above in the left col */}
          <div className="hidden lg:block space-y-8 max-w-[660px]">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-xl leading-[1.65]">
                <span className="font-medium">{p.bold}</span>{" "}
                <span className="text-muted-foreground">{p.text}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPageHero;
