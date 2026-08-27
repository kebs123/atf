import { motion } from "framer-motion";

const Tagline = () => {
  return (
    <section className="bg-foreground text-background py-24 md:py-32">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed text-center max-w-4xl mx-auto text-balance"
        >
          "Every day, thousands of Africans unknowingly buy fake personal care, drinks, building materials, and auto parts—Vero stops this by letting anyone, even with a basic phone, instantly verify a product's authenticity via SMS before it reaches their hands."
        </motion.p>
      </div>
    </section>
  );
};

export default Tagline;
