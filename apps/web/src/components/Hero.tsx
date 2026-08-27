import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { smsHint } from "@/lib/config";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1600&q=75",
    alt: "Personal care products arranged for sale",
  },
  {
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=75",
    alt: "Automotive parts and vehicle components",
  },
  {
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=75",
    alt: "Construction materials and building work",
  },
  {
    image:
      "https://images.unsplash.com/photo-1664095884822-84eefbb8b3d1?auto=format&fit=crop&w=1600&q=75",
    alt: "Knockoff sneakers stacked on cardboard boxes at a street market stall",
  },
  {
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=75",
    alt: "Fresh food and drinks arranged in a market",
  },
  {
    image:
      "https://images.unsplash.com/photo-1696774772895-013333d6d7fa?auto=format&fit=crop&w=1600&q=75",
    alt: "Replica designer handbags piled at a market stall",
  },
];

const SLIDE_DURATION = 5000;

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setProgress(0);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + 100 / (SLIDE_DURATION / 50);
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [nextSlide]);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].alt}
            width={1280}
            height={720}
            loading={currentSlide === 0 ? "eager" : "lazy"}
            fetchPriority={currentSlide === 0 ? "high" : "auto"}
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-20 left-6 md:left-12 lg:left-16 z-10 text-white">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-4"
        >
          <ShieldCheck className="w-6 h-6 text-white stroke-[1.5]" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight max-w-md text-left flex flex-col"
        >
          <span>Know It's Real.</span>
          <span>Instantly.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-4 max-w-sm text-sm text-white/80 font-light"
        >
          {smsHint()} from any phone. No app. No data.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link
            to="/verify"
            className="mt-6 inline-flex items-center gap-3 bg-white text-zinc-900 px-6 py-3 rounded-full text-sm tracking-wide hover:bg-white/90 transition-colors"
          >
            Verify a Product
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-6 md:left-12 lg:left-16 right-6 md:right-12 lg:right-16 z-10 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="flex-1 h-[2px] bg-white/30 overflow-hidden cursor-pointer"
            aria-label={`Go to slide ${index + 1}`}
          >
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                width: index === currentSlide ? `${progress}%` : index < currentSlide ? "100%" : "0%",
              }}
            />
          </button>
        ))}
      </div>
    </section>
  );
};

export default Hero;
