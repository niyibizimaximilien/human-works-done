import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Users, Briefcase, LogIn } from "lucide-react";

const navItems = [
  { href: "#", icon: Home, label: "Home" },
  { href: "#students", icon: Users, label: "Students" },
  { href: "#agents", icon: Briefcase, label: "Agents" },
];

const Navbar = () => {
  return (
    <>
      {/* Desktop top navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-xl border-b border-border hidden md:block">
        <div className="container mx-auto h-full flex items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-heading font-bold text-foreground">
              MR<span className="text-primary">.</span>ASSIGNMENT
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="outline" size="sm">
                <LogIn className="mr-1.5 h-4 w-4" />
                Log In
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="gold-glow">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile bottom taskbar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-xl border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 text-muted-foreground hover:text-primary active:text-primary transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </a>
          ))}
          <Link
            to="/auth"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <LogIn className="h-5 w-5" />
            <span className="text-[10px] font-medium">Log In</span>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
