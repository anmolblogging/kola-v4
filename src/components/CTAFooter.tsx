import { motion } from "framer-motion";
import {
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const socials = [
  { icon: Instagram, href: "https://www.instagram.com/p/DG5c5GTPtgh/", label: "Instagram" },
  { icon: Linkedin, href: "https://in.linkedin.com/company/kolacommunications", label: "LinkedIn" },
];

const services = [
  "Website Development",
  "SEO & AEO",
  "AI-Powered Tools & Applications",
  "Lead Generation & Conversion",
  "Social Media Marketing",
  "Content Creation & Strategy",
  "Brand Identity & Design",
  "Performance Marketing",
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const CTAFooter = () => (
  <footer id="contact" className="bg-[#0a0a0a] text-white pt-12 relative overflow-hidden">
    <div className="max-w-[1200px] mx-auto px-6 md:px-10">

      <motion.h2
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={fadeUp}
        custom={0}
        className="text-[clamp(2.2rem,4vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.02em] mb-16"
      >
        <span className="text-white/50 font-medium">Let's create </span>
        <span className="text-white font-semibold">incredible work together.</span>
      </motion.h2>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-14 border-b border-white/10">

        {/* BRAND */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" custom={1}>
          <img
            src="/logos/kola-logo.png"
            alt="Kola Communications"
            className="h-8 w-auto brightness-0 invert mb-5"
          />
          <p className="text-[13px] text-white/45 leading-relaxed mb-5 max-w-[280px]">
            We build websites, run SEO and social media, and create AI-powered tools that help businesses
            grow online. From strategy to execution, everything we do is designed around real results,
            not just good looks.
          </p>

          <div className="flex gap-2">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/55 hover:bg-white/10 hover:border-white/35 hover:text-white transition-all"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </motion.div>

        {/* SERVICES */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" custom={2}>
          <p className="text-[11px] uppercase tracking-widest text-white/35 mb-4">Services</p>
          <div className="flex flex-col gap-2.5">
            {services.map((s) => (
              <a key={s} href="/services" className="text-[13px] text-white/55 hover:text-white transition">
                {s}
              </a>
            ))}
          </div>
        </motion.div>

        {/* COMPANY */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" custom={3}>
          <p className="text-[11px] uppercase tracking-widest text-white/35 mb-4">Company</p>
          <div className="flex flex-col gap-2.5">
            {[
              { label: "About", href: "/about" },
              { label: "Contact Us", href: "/contact" },
              { label: "Blog", href: "/blogs" },
              { label: "Our work", href: "/projects" },
            ].map(({ label, href }) => (
              <a key={label} href={href} className="text-[13px] text-white/55 hover:text-white transition">
                {label}
              </a>
            ))}
          </div>
        </motion.div>

        {/* CONTACT */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" custom={4}>
          <p className="text-[11px] uppercase tracking-widest text-white/35 mb-4">Contact</p>

          <div className="flex flex-col gap-4 text-[13px] text-white/65">

            {/* EMAIL */}
            <a href="mailto:business@kolacommunications.com" className="flex items-center gap-2 hover:text-white transition">
              <Mail size={16} /> business@kolacommunications.com
            </a>

            {/* PHONE */}
            <a href="tel:+918928984774" className="flex items-center gap-2 hover:text-white transition">
              <Phone size={16} /> +91-8928984774
            </a>
            

            {/* ADDRESS */}
            <div className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              <span>
                23, 2nd Floor, Sharda Bhavan, Opposite Gala Provision Store, 
                Fatak Road / Narayan Joshi Road, Kandivali West, Mumbai – 400067, Maharashtra, India
              </span>
            </div>

          </div>
        </motion.div>

      </div>

      {/* BOTTOM */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 py-6">
        <p className="text-[12px] text-white/65">
          © 2026 Kola Communications. All rights reserved.
        </p>
      </div>

      {/* HUGE TEXT */}
      <p className="md:hidden text-[clamp(4rem,14vw,10rem)] font-black tracking-[-0.04em] text-white/[0.04] leading-none select-none whitespace-nowrap overflow-hidden -mb-4">
        KOLA 
      </p>

    </div>
  </footer>
);

export default CTAFooter;