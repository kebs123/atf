import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen dash-mesh flex items-center justify-center px-6 py-16 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-sm tracking-wide">Vero</span>
        </Link>
        <div className="bg-card border border-border rounded-2xl p-8 shadow-soft">{children}</div>
      </div>
    </div>
  );
}
