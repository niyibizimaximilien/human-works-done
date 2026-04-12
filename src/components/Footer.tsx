import { Link } from "react-router-dom";

const Footer = () => {
  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="text-xl font-heading font-bold text-foreground">
              MR<span className="text-primary">.</span>ASSIGNMENT
            </span>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Campus assignments done by vetted humans — on time, guaranteed. Payments in RWF.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-heading font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#how-it-works" onClick={(e) => scrollTo(e, "#how-it-works")} className="hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="#students" onClick={(e) => scrollTo(e, "#students")} className="hover:text-primary transition-colors">For Students</a></li>
              <li><a href="#agents" onClick={(e) => scrollTo(e, "#agents")} className="hover:text-primary transition-colors">For Agents</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-heading font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/support" className="hover:text-primary transition-colors">Support</Link></li>
              <li><a href="mailto:support@mrassignment.rw" className="hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-heading font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} MR ASSIGNMENT. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
