import { motion } from "framer-motion";
import { Fingerprint, Scan, Smartphone, Boxes, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Fingerprint,
    title: "Product Registration",
    description: "Manufacturers register products with unique secret codes and QR labels tied to batch data.",
  },
  {
    icon: Scan,
    title: "Consumer Verification",
    description: "Anyone can scan a QR code or SMS a scratch-code to check authenticity in seconds.",
  },
  {
    icon: Smartphone,
    title: "Instant SMS Response",
    description: "Real-time Genuine or Warning replies delivered by SMS — including on a basic feature phone.",
  },
  {
    icon: Boxes,
    title: "Batch Traceability",
    description: "Track product batches from production through distribution with a transparent provenance trail.",
  },
  {
    icon: BarChart3,
    title: "Manufacturer Analytics",
    description: "View verification activity and detect counterfeiting hotspots from a simple dashboard.",
  },
];

const Features = () => {
  return (
    <section className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-4">Core features</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Everything needed to verify authenticity and trace products from factory to consumer.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-card p-8 rounded-lg border border-border hover:shadow-md transition-shadow"
            >
              <feature.icon className="w-6 h-6 text-primary mb-5" />
              <h3 className="text-base font-light mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
