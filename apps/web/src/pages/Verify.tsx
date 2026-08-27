import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertTriangle, Search, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const codeSchema = z.string().min(3, "Code is too short").max(50, "Code is too long").regex(/^[A-Za-z0-9\-]+$/, "Only letters, numbers, and hyphens allowed");

interface ProductResult {
  code: string;
  productName: string;
  manufacturer: string;
  batch: string;
  isAuthentic: boolean;
}

// Hardcoded demo codes — no backend needed for this simple starter.
const DEMO_PRODUCTS: ProductResult[] = [
  { code: "7K4P2M9Q", productName: "Paracetamol 500mg", manufacturer: "Demo Pharma KE", batch: "B12", isAuthentic: true },
  { code: "A3N8R2T6", productName: "Cooking oil 1L", manufacturer: "Demo Foods", batch: "F04", isAuthentic: true },
  { code: "H9C1L5W2", productName: "Skin cream 50ml", manufacturer: "Demo Beauty", batch: "C09", isAuthentic: true },
  { code: "FAKE0001", productName: "Unknown Product", manufacturer: "Unknown", batch: "—", isAuthentic: false },
];

const Verify = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductResult | null>(null);
  const [checked, setChecked] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = codeSchema.safeParse(code.trim());
    if (!validation.success) {
      toast({
        title: "Invalid code",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setChecked(false);

    // Simulate a short network/SMS lookup delay.
    setTimeout(() => {
      const normalized = code.trim().toUpperCase();
      const match = DEMO_PRODUCTS.find((p) => p.code === normalized);
      setResult(match || { code: normalized, productName: "Unknown Product", manufacturer: "Unknown", batch: "—", isAuthentic: false });
      setChecked(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation variant="dark" />

      <main className="flex-1 bg-muted/30 flex items-center justify-center px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-3 h-3" />
            Back to home
          </Link>

          <div className="bg-card border border-border rounded-lg p-8 shadow-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-light tracking-tight">Verify a product</h1>
                <p className="text-xs text-muted-foreground">Enter the pack code, or SMS KEBS &lt;code&gt; to 20880</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-[11px] uppercase tracking-wider font-normal text-muted-foreground">
                  Verification Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. 7K4P2M9Q"
                  className="rounded-md"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-full text-[11px] uppercase tracking-wider font-normal">
                {loading ? "Checking..." : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Check Authenticity
                  </>
                )}
              </Button>
            </form>

            <AnimatePresence mode="wait">
              {checked && result && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-6 overflow-hidden"
                >
                  <div className={`p-5 rounded-lg border ${result.isAuthentic ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
                    <div className="flex items-start gap-3">
                      {result.isAuthentic ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                      )}
                      <div>
                        <h3 className={`text-sm font-medium ${result.isAuthentic ? "text-emerald-800" : "text-amber-800"}`}>
                          {result.isAuthentic ? "Verified Authentic" : "Counterfeit / Unknown"}
                        </h3>
                        <p className={`text-xs mt-1 ${result.isAuthentic ? "text-emerald-700" : "text-amber-700"}`}>
                          {result.isAuthentic
                            ? `This ${result.productName} from ${result.manufacturer} (batch ${result.batch}) is authentic.`
                            : "This code was not found in our system. Do not use this product and report it to the manufacturer."}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">Try a demo code</p>
              <div className="flex flex-wrap gap-2">
                {DEMO_PRODUCTS.filter((p) => p.isAuthentic).map((p) => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => {
                      setCode(p.code);
                      setResult(null);
                      setChecked(false);
                    }}
                    className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    {p.code}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setCode("FAKE0001");
                    setResult(null);
                    setChecked(false);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  FAKE0001
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Verify;
