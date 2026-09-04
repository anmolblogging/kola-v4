import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Instagram,
  Linkedin,
  ArrowUpRight,
  Sparkles,
  Send,
  CheckCircle2,
} from "lucide-react";

import ColumnGuides from "@/components/ColumnGuides";
import CustomCursor from "@/components/CustomCursor";
import AnimatedHeading from "@/components/AnimatedHeading";
import CTAFooter from "@/components/CTAFooter";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          companyName: formData.companyName,
          message: formData.message,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      setStatus("success");
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Contact Us | Kola Communications</title>
        <meta
          name="description"
          content="Get in touch with Kola Communications. Start a project or book a discovery call for web development, SEO, and performance marketing."
        />
        <link rel="canonical" href="https://www.kolacommunications.com/contact" />
      </Helmet>

      <CustomCursor />

      <div className="relative overflow-hidden">
        <ColumnGuides />

        {/* ══════════════════════════════════════════
            HERO / HEADER
           ══════════════════════════════════════════ */}
        <section className="pt-36 pb-12 md:pt-44 md:pb-16 section-container px-6 md:px-10">
          <div className="max-w-[1080px] mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-muted/60 backdrop-blur-md text-xs font-medium mb-8">
              <span className="text-muted-foreground">Response within 3–4 hours</span>
            </div>

            <AnimatedHeading
              lines={["Let's build something", "extraordinary together."]}
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
              lines={["Let's build", "something great", "together."]}
              className="
                md:hidden
                text-[clamp(2.4rem,6vw,3.5rem)]
                leading-[1.08]
                tracking-[-0.025em]
                mb-6
              "
            />

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Whether you need a high-converting website, organic visibility that compounds over time, or a scalable paid acquisition strategy, our team is ready.
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            MAIN STATIC CONTACT GRID
           ══════════════════════════════════════════ */}
        <section className="pb-24 section-container px-6 md:px-10">
          <div className="max-w-[1080px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-stretch">
              {/* LEFT: STATIC FORM (CONNECTED TO /api/contact) */}
              <div className="h-full p-7 md:p-10 rounded-3xl border border-border bg-card shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
                <AnimatePresence mode="wait">
                  {status === "success" ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-16 text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 size={36} />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">We'll be in touch!</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
                        Thanks for reaching out to Kola Communications. We've received your message and will respond within 24 hours.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setStatus("idle");
                          setFormData({
                            fullName: "",
                            email: "",
                            companyName: "",
                            message: "",
                          });
                        }}
                        className="px-6 py-2.5 rounded-full border border-border text-sm font-medium hover:bg-muted transition"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-5"
                    >
                      <div>
                        <h3 className="text-xl font-bold mb-1">Start a project</h3>
                        <p className="text-xs text-muted-foreground">
                          Tell us about your timeline, goals, and project scope.
                        </p>
                      </div>

                      {/* Full Name */}
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Your Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          required
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Jane Smith"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-black transition"
                        />
                      </div>

                      {/* Email Address */}
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          required
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="jane@company.com"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-black transition"
                        />
                      </div>

                      {/* Company / Brand */}
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Company / Brand
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="Acme Inc."
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-black transition"
                        />
                      </div>

                      {/* Project Message */}
                      <div>
                        <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Tell us about your project <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          required
                          rows={4}
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="What are your goals, timeline, and current challenges?"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:border-black transition"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full py-3.5 bg-black text-white rounded-xl flex items-center justify-center gap-2 text-sm font-medium hover:opacity-90 transition disabled:opacity-50 shadow-md"
                      >
                        {status === "loading" ? "Sending..." : "Send Message"}
                        <Send size={14} />
                      </button>

                      {status === "error" && (
                        <p className="text-xs text-red-500 text-center mt-2">
                          Something went wrong while sending your message. Please try again or email us directly.
                        </p>
                      )}
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* RIGHT: DIRECT INFO & ADDRESS */}
              <div className="h-full">
                {/* Contact Card */}
                <div className="h-full p-7 md:p-8 rounded-3xl border border-border bg-[#fafafa]">
                  <h3 className="text-lg font-bold mb-6">Direct Information</h3>

                  <div className="space-y-5 text-sm">
                    {/* Email */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center shrink-0">
                        <Mail size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Email Us</p>
                        <a
                          href="mailto:business@kolacommunications.com"
                          className="font-medium hover:underline text-foreground"
                        >
                          business@kolacommunications.com
                        </a>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center shrink-0">
                        <Phone size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Call / WhatsApp</p>
                        <a
                          href="tel:+918928984774"
                          className="font-medium hover:underline text-foreground"
                        >
                          +91-8928984774
                        </a>
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center shrink-0">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Business Hours</p>
                        <p className="font-medium text-foreground">
                          Mon – Fri: 9:30 AM – 9:00 PM IST
                        </p>
                        <p className="text-xs text-muted-foreground">
                          (Flexible timezone coverage for US, UK, Australia & UAE)
                        </p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center shrink-0">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Headquarters</p>
                        <p className="font-medium text-foreground leading-relaxed">
                          23, 2nd Floor, Sharda Bhavan, Opposite Gala Provision Store, <br />
                          Fatak Road / Narayan Joshi Road, Kandivali West, <br />
                          Mumbai – 400067, Maharashtra, India
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Social links */}
                  <div className="pt-6 border-t border-border mt-6 flex items-center gap-3">
                    <a
                      href="https://in.linkedin.com/company/kolacommunications"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-white text-xs font-medium hover:bg-muted transition"
                    >
                      <Linkedin size={13} />
                      LinkedIn
                      <ArrowUpRight size={12} />
                    </a>
                    <a
                      href="https://www.instagram.com/p/DG5c5GTPtgh/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-white text-xs font-medium hover:bg-muted transition"
                    >
                      <Instagram size={13} />
                      Instagram
                      <ArrowUpRight size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <CTAFooter />
    </div>
  );
};

export default ContactPage;
