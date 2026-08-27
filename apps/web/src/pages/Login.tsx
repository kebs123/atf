import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { homeFor, login } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

const Login = () => {
  const session = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (session) return <Navigate to={homeFor(session)} replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = login(email, password);
    setLoading(false);
    if (!result.ok) {
      toast({ title: "Could not sign in", description: result.message, variant: "destructive" });
      return;
    }
    navigate(homeFor(result.session), { replace: true });
  };

  return (
    <div className="min-h-screen dash-mesh flex items-center justify-center px-6 py-16 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-3 h-3" />
          Back to home
        </Link>
        <div className="bg-card border border-border rounded-lg p-8 shadow-soft">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-sm tracking-wide">Vero</span>
          </div>
          <h1 className="text-xl font-light tracking-tight">Staff sign in</h1>
          <p className="text-xs text-muted-foreground mt-1 mb-6">
            Manufacturers and admins. Shoppers verify without an account.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[11px] uppercase tracking-wider font-normal text-muted-foreground">
                Email
              </Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.ke" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[11px] uppercase tracking-wider font-normal text-muted-foreground">
                Password
              </Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
            </div>
            <Button type="submit" disabled={loading} className="w-full rounded-full text-[11px] uppercase tracking-wider font-normal">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-6">
            New manufacturer?{" "}
            <Link to="/signup" className="text-foreground underline underline-offset-4">
              Create a company account
            </Link>
          </p>
          <p className="text-[11px] text-muted-foreground mt-6 pt-6 border-t border-border">
            Demo: manufacturer@vero.demo or admin@vero.demo · demo1234
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
