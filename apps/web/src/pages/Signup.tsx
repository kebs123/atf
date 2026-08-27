import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { homeFor, registerManufacturer } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

const Signup = () => {
  const session = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (session) return <Navigate to={homeFor(session)} replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const result = registerManufacturer({ companyName, name, email, password });
    setLoading(false);
    if (!result.ok) {
      toast({ title: "Could not register", description: result.message, variant: "destructive" });
      return;
    }
    toast({
      title: "Account created",
      description: "Vero must approve your company before you can generate codes.",
    });
    navigate("/app", { replace: true });
  };

  return (
    <div className="min-h-screen dash-mesh flex items-center justify-center px-6 py-16 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-3 h-3" />
          Back to sign in
        </Link>
        <div className="bg-card border border-border rounded-lg p-8 shadow-soft">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-sm tracking-wide">Vero</span>
          </div>
          <h1 className="text-xl font-light tracking-tight">Register your company</h1>
          <p className="text-xs text-muted-foreground mt-1 mb-6">
            One primary action: apply as a manufacturer. Status starts as pending until an admin approves you.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-[11px] uppercase tracking-wider font-normal text-muted-foreground">
                Company name
              </Label>
              <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Demo Pharma KE" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[11px] uppercase tracking-wider font-normal text-muted-foreground">
                Your name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Amina Otieno" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[11px] uppercase tracking-wider font-normal text-muted-foreground">
                Work email
              </Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.ke" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[11px] uppercase tracking-wider font-normal text-muted-foreground">
                Password
              </Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required />
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-full text-[11px] uppercase tracking-wider font-normal">
              {loading ? "Submitting..." : "Create account"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-6">
            Already registered?{" "}
            <Link to="/login" className="text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
