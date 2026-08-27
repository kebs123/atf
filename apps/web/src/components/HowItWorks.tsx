import { motion } from "framer-motion";
import { Package, ScanLine, MessageCircle } from "lucide-react";

const steps = [
  {
    icon: Package,
    title: "Register",
    description: "Manufacturers register each product batch with a unique secret code or QR label.",
  },
  {
    icon: ScanLine,
    title: "Scan or SMS",
    description: "Consumers scratch the label and scan the QR code—or SMS the code using any basic phone.",
  },
  {
    icon: MessageCircle,
    title: "Instant Result",
    description: "Vero replies in seconds: Genuine, Warning, Recalled, or Not found — with product and batch details.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-4">How it works</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Three simple steps that protect consumers and build trust in local manufacturing.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-6">
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-light mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
