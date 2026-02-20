import { Link, useLocation } from "react-router-dom";
import { Upload, LayoutDashboard, Tv, Radio } from "lucide-react";

const navItems = [
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/painel", label: "Painel", icon: LayoutDashboard },
  { href: "/tv", label: "TV Player", icon: Tv },
];

const NavBar = () => {
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-7 h-7">
            <Radio className="w-5 h-5 text-cyan" />
            <span className="absolute inset-0 rounded-full bg-cyan/10 group-hover:bg-cyan/20 transition-colors" />
          </div>
          <span className="font-bold text-sm tracking-wide">
            <span className="text-cyan">opendata</span>
            <span className="text-foreground">.center</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location.pathname.startsWith(href);
            return (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 ${
                  active
                    ? "bg-cyan/10 text-cyan shadow-glow-cyan-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow" />
          <span className="text-xs text-muted-foreground font-mono">R2 Online</span>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
