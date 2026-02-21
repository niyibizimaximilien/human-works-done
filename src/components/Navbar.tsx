import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, BookOpen, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto h-full flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-foreground">
            MR<span className="text-primary">.</span>ASSIGNMENT
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            How It Works
          </a>
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            Features
          </a>
          <a href="#store" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            Store
          </a>
          <a href="#earn" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            Earn Money
          </a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" size="sm">Log In</Button>
          <Button size="sm">Get Started</Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 py-4 space-y-3">
          <a href="#how-it-works" className="block text-muted-foreground hover:text-foreground text-sm">How It Works</a>
          <a href="#features" className="block text-muted-foreground hover:text-foreground text-sm">Features</a>
          <a href="#store" className="block text-muted-foreground hover:text-foreground text-sm">Store</a>
          <a href="#earn" className="block text-muted-foreground hover:text-foreground text-sm">Earn Money</a>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">Log In</Button>
            <Button size="sm" className="flex-1">Get Started</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
