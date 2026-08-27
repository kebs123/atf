import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/AuthShell";
import { homeFor, login, type Session } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const session = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (session) return <Navigate to={homeFor(session)} replace />;

  const go = (next: Session) => {
    navigate(homeFor(next), { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok === false) {
      toast({ title: "Could not sign in", description: result.message, variant: "destructive" });
      return;
    }
    go(result.session);
  };

  return (
    <AuthShell>
      <h1 className="text-2xl font-light tracking-tight">Log in</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-6">Use the email and password registered with Vero.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.ke"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full rounded-full">
          {loading ? "Signing in..." : "Log in"}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground mt-6">
        New here?{" "}
        <Link to="/signup" className="text-foreground underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
};

export default Login;
