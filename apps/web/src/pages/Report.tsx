import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Flag } from "lucide-react";
import { z } from "zod";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { submitReport, userMessage } from "@/lib/api";

const codeSchema = z
  .string()
  .min(3, "Code is too short")
  .max(50, "Code is too long")
  .regex(/^[A-Za-z0-9\-]+$/, "Only letters, numbers, and hyphens allowed");

const Report = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [place, setPlace] = useState("");
  const [note, setNote] = useState("");
  const [contact, setContact] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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
    try {
      await submitReport({ code: validation.data, note, place, contact });
      setSubmitted(true);
    } catch (err) {
      toast({ title: "Could not send report", description: userMessage(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
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
          <Link to="/verify" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-3 h-3" />
            Back to verify
          </Link>

          <div className="bg-card border border-border rounded-lg p-8 shadow-soft">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Flag className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h1 className="text-xl font-light tracking-tight">Report a counterfeit</h1>
                <p className="text-xs text-muted-foreground">Anyone can file this. No account required.</p>
              </div>
            </div>

            {submitted ? (
              <div className="space-y-4">
                <div className="p-5 rounded-lg border bg-emerald-50 border-emerald-200">
                  <p className="text-sm font-medium text-emerald-800">Report received</p>
                  <p className="text-xs mt-1 text-emerald-700">
                    Vero and the brand can review code {code.trim().toUpperCase()} from the reports inbox. This does not prove the pack is fake — it starts an investigation.
                  </p>
                </div>
                <Button asChild className="w-full rounded-full text-[11px] uppercase tracking-wider font-normal">
                  <Link to="/verify">Check another code</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-[11px] uppercase tracking-wider font-normal text-muted-foreground">
                    Pack code
                  </Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. SGSP792F"
                    className="rounded-md"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="place" className="text-[11px] uppercase tracking-wider font-normal text-muted-foreground">
                    Where you saw or bought it
                  </Label>
                  <Input
                    id="place"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    placeholder="Shop, market, town"
                    className="rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note" className="text-[11px] uppercase tracking-wider font-normal text-muted-foreground">
                    What seemed wrong
                  </Label>
                  <textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={4}
                    placeholder="Seal, print, taste, seller…"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-[11px] uppercase tracking-wider font-normal text-muted-foreground">
                    Phone or email (optional)
                  </Label>
                  <Input
                    id="contact"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="If we may follow up"
                    className="rounded-md"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full rounded-full text-[11px] uppercase tracking-wider font-normal">
                  {loading ? "Sending..." : "Submit report"}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Report;
