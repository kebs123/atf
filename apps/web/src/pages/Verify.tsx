import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertTriangle, Search, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { userMessage, verifyCode, type VerifyOutcome } from "@/lib/api";
import { smsHint } from "@/lib/config";
import { resultLabel, type ResultCode } from "@/lib/results";

const codeSchema = z
  .string()
  .min(3, "Code is too short")
  .max(50, "Code is too long")
  .regex(/^[A-Za-z0-9\-]+$/, "Only letters, numbers, and hyphens allowed");

const banner: Record<ResultCode, { className: string; icon: "ok" | "warn"; body: (r: VerifyOutcome) => string }> = {
  genuine: {
    className: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800",
    icon: "ok",
    body: (r) =>
      r.message ||
      `${r.productName} from ${r.manufacturer}${r.batch !== "—" ? ` · batch ${r.batch}` : ""}${r.expiry ? ` · exp ${r.expiry}` : ""}. First check. If the pack looks tampered, do not use.`,
  },
  already_verified: {
    className: "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800",
    icon: "warn",
    body: (r) =>
      r.message ||
      `This code was first checked${r.firstVerifiedAt ? ` ${r.firstVerifiedAt}` : " earlier"}. If that was not you, do not use this product.`,
  },
  recalled: {
    className: "bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800",
    icon: "warn",
    body: (r) => r.message || `Do not use. Return to seller.${r.batch !== "—" ? ` Batch ${r.batch}.` : ""}`,
  },
  expired: {
    className: "bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800",
    icon: "warn",
    body: (r) => r.message || `Past expiry${r.expiry ? ` (${r.expiry})` : ""}. Do not use.`,
  },
  flagged: {
    className: "bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800",
    icon: "warn",
    body: (r) => r.message || "This code is under review. Do not use.",
  },
  unknown: {
    className: "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800",
    icon: "warn",
    body: (r) => r.message || "This code was not found. Check the digits. If the print is clear, treat the pack as unsafe.",
  },
};

export default function Verify() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyOutcome | null>(null);
  const [checked, setChecked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const q = searchParams.get("code");
    if (q) setCode(q);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
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
    try {
      const outcome = await verifyCode(validation.data);
      setResult(outcome);
      setChecked(true);
    } catch (err) {
      toast({
        title: "Could not check this code",
        description: userMessage(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const style = result ? banner[result.result] : null;

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
                <p className="text-xs text-muted-foreground">Enter the pack code, or {smsHint()}</p>
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
                  placeholder="e.g. SGSP792F"
                  className="rounded-md"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-full text-[11px] uppercase tracking-wider font-normal">
                {loading ? (
                  "Checking..."
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Check Authenticity
                  </>
                )}
              </Button>
            </form>

            <AnimatePresence mode="wait">
              {checked && result && style && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-6 overflow-hidden"
                >
                  <div className={`p-5 rounded-lg border ${style.className}`}>
                    <div className="flex items-start gap-3">
                      {style.icon === "ok" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                      )}
                      <div>
                        <h3 className="text-sm font-medium">{resultLabel(result.result)}</h3>
                        <p className="text-xs mt-1 text-muted-foreground">{style.body(result)}</p>
                        <p className="text-[11px] mt-2 text-muted-foreground">This describes the code, not a guarantee that the pack is safe.</p>
                        <Link
                          to={`/report?code=${encodeURIComponent(result.code)}`}
                          className="inline-flex mt-3 text-xs underline underline-offset-4"
                        >
                          Report this as counterfeit
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
