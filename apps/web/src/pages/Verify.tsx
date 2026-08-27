import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  Search,
  ArrowLeft,
  CheckCircle2,
  Ban,
  CalendarX,
  ShieldAlert,
  HelpCircle,
  WifiOff,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ApiError, verifyCode, type VerificationResult, type VerifyResponse } from "@/lib/api";

// Spaces and hyphens are allowed: the backend strips them (and a leading keyword)
// before looking the code up, so "kebs 3lfe 7nel" is the same as "3LFE7NEL".
const codeSchema = z
  .string()
  .min(3, "Code is too short")
  .max(50, "Code is too long")
  .regex(/^[A-Za-z0-9\s-]+$/, "Only letters, numbers, spaces and hyphens allowed");

type Tone = "good" | "warn" | "bad";

const TONES: Record<Tone, { box: string; heading: string; body: string; icon: string }> = {
  good: {
    box: "bg-emerald-50 border-emerald-200",
    heading: "text-emerald-800",
    body: "text-emerald-700",
    icon: "text-emerald-600",
  },
  warn: {
    box: "bg-amber-50 border-amber-200",
    heading: "text-amber-800",
    body: "text-amber-700",
    icon: "text-amber-600",
  },
  bad: {
    box: "bg-red-50 border-red-200",
    heading: "text-red-800",
    body: "text-red-700",
    icon: "text-red-600",
  },
};

/** One entry per outcome the API can return. Only `genuine` is good news. */
const OUTCOMES: Record<
  VerificationResult,
  { title: string; tone: Tone; Icon: typeof CheckCircle2 }
> = {
  genuine: { title: "Genuine", tone: "good", Icon: CheckCircle2 },
  already_verified: { title: "Warning — already checked", tone: "warn", Icon: AlertTriangle },
  flagged: { title: "Under review", tone: "warn", Icon: ShieldAlert },
  expired: { title: "Expired", tone: "bad", Icon: CalendarX },
  recalled: { title: "Recalled — do not use", tone: "bad", Icon: Ban },
  unknown: { title: "Code not found", tone: "bad", Icon: HelpCircle },
};

// Optional convenience chips, e.g. VITE_DEMO_CODES="3LFE7NEL,EF4E5JYP,FAKE2345".
const DEMO_CODES = (import.meta.env.VITE_DEMO_CODES ?? "")
  .split(",")
  .map((code) => code.trim())
  .filter((code) => code.length > 0);

const Verify = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const { toast } = useToast();
  const inFlight = useRef<AbortController | null>(null);

  // Never leave a request running after the page goes away.
  useEffect(() => () => inFlight.current?.abort(), []);

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

    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await verifyCode(code.trim(), controller.signal);
      setResult(response);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      const apiError =
        err instanceof ApiError ? err : new ApiError(0, "Something went wrong. Try again.");
      setError(apiError);
      toast({
        title: apiError.status === 0 ? "Cannot reach the server" : "Check failed",
        description: apiError.message,
        variant: "destructive",
      });
    } finally {
      if (inFlight.current === controller) {
        inFlight.current = null;
        setLoading(false);
      }
    }
  };

  const outcome = result ? OUTCOMES[result.result] : null;
  const tone = outcome ? TONES[outcome.tone] : null;

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
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
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
                <p className="text-xs text-muted-foreground">
                  Enter the pack code, or SMS VERO &lt;code&gt; to 20880
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="code"
                  className="text-[11px] uppercase tracking-wider font-normal text-muted-foreground"
                >
                  Verification Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. 3LFE7NEL"
                  className="rounded-md uppercase"
                  autoComplete="off"
                  autoCapitalize="characters"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-full text-[11px] uppercase tracking-wider font-normal"
              >
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
              {result && outcome && tone && (
                <motion.div
                  key={`${result.result}-${result.message}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-6 overflow-hidden"
                >
                  <div className={`p-5 rounded-lg border ${tone.box}`}>
                    <div className="flex items-start gap-3">
                      <outcome.Icon className={`w-5 h-5 mt-0.5 shrink-0 ${tone.icon}`} />
                      <div className="min-w-0">
                        <h3 className={`text-sm font-medium ${tone.heading}`}>{outcome.title}</h3>
                        {/* The API's own wording, so web, SMS and USSD never disagree. */}
                        <p className={`text-xs mt-1 ${tone.body}`}>{result.message}</p>

                        {(result.productName || result.batchNumber || result.expiresAt) && (
                          <dl className={`mt-3 space-y-1 text-xs ${tone.body}`}>
                            {result.productName && (
                              <div className="flex gap-2">
                                <dt className="opacity-70">Product</dt>
                                <dd className="font-medium">{result.productName}</dd>
                              </div>
                            )}
                            {result.batchNumber && (
                              <div className="flex gap-2">
                                <dt className="opacity-70">Batch</dt>
                                <dd className="font-medium">{result.batchNumber}</dd>
                              </div>
                            )}
                            {result.expiresAt && (
                              <div className="flex gap-2">
                                <dt className="opacity-70">Expires</dt>
                                <dd className="font-medium">{result.expiresAt}</dd>
                              </div>
                            )}
                            {result.firstVerifiedAt && (
                              <div className="flex gap-2">
                                <dt className="opacity-70">First checked</dt>
                                <dd className="font-medium">{result.firstVerifiedAt} UTC</dd>
                              </div>
                            )}
                          </dl>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  key={`error-${error.status}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-6 overflow-hidden"
                >
                  <div className="p-5 rounded-lg border bg-muted border-border">
                    <div className="flex items-start gap-3">
                      <WifiOff className="w-5 h-5 mt-0.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium">Could not check the code</h3>
                        <p className="text-xs mt-1 text-muted-foreground">{error.message}</p>
                        {error.requestId && (
                          <p className="text-[11px] mt-2 text-muted-foreground font-mono">
                            ref {error.requestId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {DEMO_CODES.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">
                  Try a demo code
                </p>
                <div className="flex flex-wrap gap-2">
                  {DEMO_CODES.map((demo) => (
                    <button
                      key={demo}
                      type="button"
                      onClick={() => {
                        setCode(demo);
                        setResult(null);
                        setError(null);
                      }}
                      className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors font-mono"
                    >
                      {demo}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Verify;
