import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth/AuthShell";
import { homeFor, registerManufacturer } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const Signup = () => {
  const session = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  if (session) return <Navigate to={homeFor(session)} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords do not match", description: "Re-enter the same password.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const result = await registerManufacturer({
      companyName: companyName.trim() || `${name.trim()}'s company`,
      name,
      email,
      password,
    });
    setLoading(false);
    if (result.ok === false) {
      toast({ title: "Could not create account", description: result.message, variant: "destructive" });
      return;
    }
    toast({
      title: "Welcome",
      description: "Your manufacturer dashboard is ready.",
    });
    navigate(homeFor(result.session), { replace: true });
  };

  return (
    <AuthShell>
      <h1 className="text-2xl font-light tracking-tight">Create an account</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-6">Create a manufacturer account and open your dashboard.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Amina Otieno" required />
        </div>
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
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            autoComplete="organization"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Your company name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat password"
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full rounded-full">
          {loading ? "Creating account..." : "Sign up"}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
};

export default Signup;
