import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { lazy, Suspense, useEffect } from "react";

import Navbar from "@/components/Navbar";
import Lenis from "@studio-freight/lenis";
import { HelmetProvider } from "react-helmet-async";


const Index = lazy(() => import("./pages/Index"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProjectPage = lazy(() => import("./pages/ProjectsPage"));
const ProjectDisplay = lazy(() => import("./pages/ProjectDisplay"));
const BlogDisplay = lazy(() => import("./pages/BlogDisplay"));
const BlogPage = lazy(() => import("./pages/BlogPage"));

const SlugResolver = lazy(() => import("./pages/SlugResolver"));

import SectionSkeleton from "./components/SectionSkeleton";
import ScrollToTopWrapper from "@/components/ScrollToTopWrapper";
import { useTextBlockSelection } from "@/hooks/useTextBlockSelection";

const queryClient = new QueryClient();

export let lenisInstance = null;

const SmoothScroll = ({ children }) => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    });

    lenisInstance = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return children;
};

const App = () => {
  // Triple-click selects the whole heading/paragraph on every page, whatever
  // its internal markup (line spans, <br>, animated word spans).
  useTextBlockSelection();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HelmetProvider>
        <BrowserRouter>
          <ScrollToTopWrapper>
            <SmoothScroll>
              <Navbar />

              <Suspense fallback={<SectionSkeleton/>}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/about-us" element={<AboutPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/contact-us" element={<ContactPage />} />
                  <Route path="/projects" element={<ProjectDisplay />} />
                  <Route path="/project-category/:slug" element={<ProjectDisplay />} />
                  <Route path="/project-tag/:slug" element={<ProjectDisplay />} />
                  <Route path="/blogs" element={<BlogDisplay />} />

                  <Route path="/category/:slug" element={<BlogDisplay />} />
                  <Route path="/tag/:slug" element={<BlogDisplay />} />
                  <Route path="/project/:slug" element={<SlugResolver />} />
                  <Route path="/blogs/:slug" element={<SlugResolver />} />
                  <Route path="/:slug" element={<SlugResolver />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </SmoothScroll>
          </ScrollToTopWrapper>
        </BrowserRouter>
        </HelmetProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
