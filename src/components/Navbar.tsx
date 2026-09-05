import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import logo from "/KolaFavicon.jpg"

const avatarImg = "/logos/kola-logo.png";
// const logo = "https://kolacommunications.com/favicon.png";

const navLinks = [
  { label: "About", to: "/about", type: "link" },
  { label: "Services", to: "/services", type: "link" },
  { label: "Our Work", to: "/projects", type: "link" },
  { label: "Blogs", to: "/blogs", type: "link" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>

      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[calc(100%-48px)] lg:w-auto">
        <motion.div
          animate={{ padding: "10px 18px" }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="
            flex items-center justify-between gap-6
            backdrop-blur-2xl
            bg-white/20
            border border-black/8
            shadow-[0_4px_24px_rgba(0,0,0,0.06)]
            rounded-full
          "
        >
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2.5 text-sm font-medium">
            <img src={logo} className="w-8 h-8 bg-white rounded-full" />
            <img src={avatarImg} className="w-16 h-8 rounded-full" />
          </Link>

          {/* DESKTOP LINKS */}
          <motion.div className="hidden lg:flex items-center gap-7 overflow-hidden">
            {navLinks.map((link) =>
              link.type === "hash" ? (
                <HashLink
                  key={link.label}
                  to={link.to}
                  smooth
                  className="text-sm text-black/80 hover:text-black transition"
                >
                  {link.label}
                </HashLink>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-sm text-black/80 hover:text-black transition"
                >
                  {link.label}
                </Link>
              )
            )}
          </motion.div>

          {/* CONTACT */}
          <motion.div
            animate={{ opacity: 1, width: "auto" }}
            className="hidden lg:inline-flex"
          >
            <Link
              to="/contact"
              className="rounded-full -mr-14 bg-black text-white px-5 py-2 text-sm font-medium whitespace-nowrap hover:opacity-90 transition"
            >
              Contact
            </Link>
          </motion.div>

          {/* DESKTOP DOTS */}
          <motion.div
            animate={{ opacity: 0 }}
            className="hidden lg:flex items-center gap-1 cursor-pointer"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                className="w-1.5 h-1.5 rounded-full bg-black"
              />
            ))}
          </motion.div>

          {/* MOBILE & TABLET BUTTON */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex items-center gap-1 p-2"
          >
            {mobileOpen ? (
              <X size={20} />
            ) : (
              <>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1.5 h-1.5 rounded-full bg-black"
                  />
                ))}
              </>
            )}
          </button>
        </motion.div>

        {/* MOBILE & TABLET MENU */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
                className="
                  lg:hidden
                  absolute left-0 right-0 mt-2
                  bg-white
                  border border-black/8
                  shadow-[0_8px_32px_rgba(0,0,0,0.10)]
                  rounded-2xl
                  overflow-hidden
                  z-50
                "
              >
                <div className="flex flex-col px-5 py-3">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      {link.type === "hash" ? (
                        <HashLink
                          to={link.to}
                          smooth
                          onClick={() => setMobileOpen(false)}
                          className="block py-3 text-[15px] text-black/70 hover:text-black border-b border-black/5"
                        >
                          {link.label}
                        </HashLink>
                      ) : (
                        <Link
                          to={link.to}
                          onClick={() => setMobileOpen(false)}
                          className="block py-3 text-[15px] text-black/70 hover:text-black border-b border-black/5"
                        >
                          {link.label}
                        </Link>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="px-5 pb-5 pt-1">
                  <Link
                    to="/contact"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-full bg-black text-white py-3 text-sm font-medium w-full"
                  >
                    Contact
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;