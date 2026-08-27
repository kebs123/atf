import { ShieldCheck, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return <footer className="bg-foreground text-background py-20 lg:py-24">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col gap-10 lg:gap-12">
          {/* Brand Row */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm font-normal tracking-wide">Vero</span>
            </div>
            <p className="text-background/70 text-xs font-light leading-relaxed max-w-xs">
              Protecting African consumers from counterfeit products with instant SMS and web verification.
            </p>
          </div>

          {/* Pages Row - Two Columns on Mobile */}
          <div>
            <h4 className="text-sm font-medium mb-4">Pages</h4>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3">
              <li>
                <Link to="/" className="text-background/70 hover:text-background smooth-hover text-xs font-light">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/verify" className="text-background/70 hover:text-background smooth-hover text-xs font-light">
                  Verify
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" className="text-background/70 hover:text-background smooth-hover text-xs font-light">
                  How it works
                </a>
              </li>
              <li>
                <Link to="/login" className="text-background/70 hover:text-background smooth-hover text-xs font-light">
                  Staff sign in
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Row */}
          <div>
            <h4 className="text-sm font-medium mb-4">Contact Us</h4>
            <div className="flex flex-col gap-2">
              <a href="mailto:hello@vero.africa" className="text-background/70 hover:text-background smooth-hover text-xs font-light flex items-center gap-2">
                <Mail className="h-3 w-3" />
                hello@vero.africa
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 mt-12 text-center text-background/50 text-xs font-light">
          <p>&copy; 2026 Vero. All rights reserved.</p>
        </div>
      </div>
    </footer>;
};

export default Footer;
