import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Smartphone, ShieldCheck } from "lucide-react";

const CATEGORY_DURATION = 5000; // 5 seconds per category

const categories = [
  {
    id: "personal-care",
    name: "Personal Care",
    real: {
      title: "Authentic Cosmetics / Lotions",
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
      marks: [
        "KEBS Standardization Mark (SM) with valid ISM registration",
        "Clear ingredients, expiry date, and batch number printed",
        "Factory-sealed tamper-evident packaging"
      ],
    },
    fake: {
      title: "Counterfeit Beauty Products",
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
      marks: [
        "Missing or blurry KEBS permit logo",
        "Smudged printing with missing batch info",
        "Harmful unlisted chemicals or strange odor"
      ],
    },
  },
  {
    id: "automotive",
    name: "Automotive Parts",
    real: {
      title: "Genuine Engine Lubricant (Shell / Total)",
      // Updated Engine Oil photo
      image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80",
      marks: [
        "Interactive 20880 SMS verification code on neck label",
        "Intact holographic security seal",
        "Molded brand logo stamped on bottle bottom"
      ],
    },
    fake: {
      title: "Recycled / Adulterated Motor Oil",
      image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80",
      marks: [
        "No SMS code under the cap/foil sticker",
        "Foil seal re-glued or missing entirely",
        "Misspelled warning text on rear label"
      ],
    },
  },
  {
    id: "construction",
    name: "Construction Materials",
    real: {
      title: "Standardized Cement (Bamburi / Simba)",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
      marks: [
        "KS EAS 18-1 certification code stenciled clearly",
        "Official Diamond Mark of Quality",
        "Moisture-proof, multi-ply heavy-duty paper bag"
      ],
    },
    fake: {
      title: "Substandard Re-bagged Cement",
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80",
      marks: [
        "Faded print without KEBS accreditation mark",
        "Frequently underweight (under 50kg limit)",
        "Hard lumps indicating exposure to moisture"
      ],
    },
  },
  {
    id: "fuel",
    name: "Fuel & Petroleum",
    real: {
      title: "Certified LPG Gas Cylinder",
      image: "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80",
      marks: [
        "Branded safety seal shrink-wrapped over valve",
        "Tare weight permanently stamped on cylinder collar",
        "Valid EPRA / KEBS inspection code"
      ],
    },
    fake: {
      title: "Illegally Refilled Gas Cylinder",
      // Updated LPG / Fuel photo
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
      marks: [
        "Generic unbranded transparent plastic seal",
        "Missing or corroded tare weight markings",
        "Faulty safety valve prone to leaks"
      ],
    },
  },
  {
    id: "food-drinks",
    name: "Food & Drinks",
    real: {
      title: "Fortified Cooking Oil / Packed Food",
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
      marks: [
        "National Food Fortification logo (Vitamin A)",
        "SMS verification sticker registered on 20880",
        "Crisp expiration date stamp on container body"
      ],
    },
    fake: {
      title: "Unfortified / Adulterated Oil",
      image: "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=800&q=80",
      marks: [
        "Missing Fortification Logo",
        "Duplicate or invalid KEBS verification code",
        "Discolored liquid with cloudy sediment"
      ],
    },
  },
  {
    id: "alcohol",
    name: "Alcoholic Beverages",
    real: {
      title: "Duty-Paid Spirits & Beverages",
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
      marks: [
        "KRA Excise Stamp with scannable QR code",
        "KEBS ISM authentication mark",
        "Factory-sealed neck wrap without glue residue"
      ],
    },
    fake: {
      title: "Illicit / Counterfeit Spirits",
      image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=800&q=80",
      marks: [
        "Photocopied or crooked KRA excise stamp",
        "Mismatched barcode on back label",
        "Dangerous high methanol contents"
      ],
    },
  },
];

const Tagline = () => {
  const [activeTab, setActiveTab] = useState(categories[0].id);

  // Function to step through categories
  const nextCategory = useCallback(() => {
    setActiveTab((prevTab) => {
      const currentIndex = categories.findIndex((c) => c.id === prevTab);
      const nextIndex = (currentIndex + 1) % categories.length;
      return categories[nextIndex].id;
    });
  }, []);

  // Auto-switch category timer
  useEffect(() => {
    const timer = setInterval(() => {
      nextCategory();
    }, CATEGORY_DURATION);

    return () => clearInterval(timer);
  }, [nextCategory]);

  const activeCategory = categories.find((c) => c.id === activeTab) || categories[0];

  return (
    <section className="bg-foreground text-background py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs tracking-widest uppercase mb-4 text-emerald-400">
            <ShieldCheck className="w-4 h-4" /> Market Verification
          </span>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight">
            Spotting Counterfeits in Kenya
          </h2>
          <p className="mt-3 text-sm text-background/70">
            Compare genuine KEBS-compliant items against common illicit market fakes.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`relative px-4 py-2 rounded-full text-xs md:text-sm transition-all duration-300 cursor-pointer overflow-hidden ${
                activeTab === cat.id
                  ? "bg-white text-black font-medium shadow-lg scale-105"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              <span className="relative z-10">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Comparison Showcase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          >
            {/* REAL PRODUCT CARD */}
            <div className="relative rounded-2xl bg-white/5 border border-emerald-500/30 overflow-hidden p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Genuine (KEBS Standard)
                  </span>
                </div>
                <div className="relative h-56 rounded-xl overflow-hidden mb-6 bg-black/40">
                  <img
                    src={activeCategory.real.image}
                    alt={activeCategory.real.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <p className="absolute bottom-3 left-3 text-white font-medium text-sm">
                    {activeCategory.real.title}
                  </p>
                </div>
                <ul className="space-y-2.5">
                  {activeCategory.real.marks.map((mark, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-background/90">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{mark}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* FAKE PRODUCT CARD */}
            <div className="relative rounded-2xl bg-white/5 border border-rose-500/30 overflow-hidden p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-semibold">
                    <XCircle className="w-4 h-4" /> Counterfeit / Substandard
                  </span>
                </div>
                <div className="relative h-56 rounded-xl overflow-hidden mb-6 bg-black/40">
                  <img
                    src={activeCategory.fake.image}
                    alt={activeCategory.fake.title}
                    className="w-full h-full object-cover opacity-80"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <p className="absolute bottom-3 left-3 text-white font-medium text-sm">
                    {activeCategory.fake.title}
                  </p>
                </div>
                <ul className="space-y-2.5">
                  {activeCategory.fake.marks.map((mark, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-background/70">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{mark}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* SMS Verification Prompt Divider */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-white/10 px-5 py-2.5 rounded-full text-xs md:text-sm text-white/90">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>SMS <strong>KEBS &lt;Code&gt;</strong> to <strong>20880</strong> to verify any product in Kenya instantly</span>
          </div>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
          className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed text-center max-w-4xl mx-auto text-balance border-t border-white/10 pt-12 mt-12"
        >
          "Every day, thousands of Africans unknowingly buy fake personal care, drinks, building materials, and auto parts—Vero stops this by letting anyone, even with a basic phone, instantly verify a product's authenticity via SMS before it reaches their hands."
        </motion.p>
      </div>
    </section>
  );
};

export default Tagline;