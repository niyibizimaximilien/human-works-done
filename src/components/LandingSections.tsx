import { Button } from "@/components/ui/button";
import {
  Upload, CheckCircle, Clock, Shield, Users, ShoppingBag, DollarSign,
  ArrowRight, FileText, Star, Zap, BookOpen, Pencil, FlaskConical,
  Calculator, Rocket, BadgeCheck, Lock, MessageCircle, TrendingUp,
  Award, Banknote, Globe, Heart, Sparkles
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => (
  <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16 pb-20 md:pb-0">
    <div
      className="absolute inset-0 bg-cover bg-center opacity-30"
      style={{ backgroundImage: `url(${heroBg})` }}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
    <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 mb-6">
        <Rocket className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">Trusted by 500+ campus students</span>
      </div>
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6">
        Campus assignments done by{" "}
        <span className="text-gradient-neon">vetted humans</span>
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
        Upload your assignment, set a deadline, and let verified class-specific agents deliver quality work — on time, guaranteed.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button variant="hero" size="lg">
          <Upload className="mr-2 h-5 w-5" />
          Submit Assignment
        </Button>
        <Button variant="outline" size="lg">
          <BadgeCheck className="mr-2 h-5 w-5" />
          Become an Agent
        </Button>
      </div>
      <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span>100% Human Work</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span>On-time Delivery</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          <span>Escrow Protected</span>
        </div>
      </div>
    </div>
  </section>
);

const HowItWorksSection = () => {
  const steps = [
    { icon: Upload, title: "Upload Assignment", desc: "Post your assignment with class, deadline, budget, and files." },
    { icon: Users, title: "Agent Accepts", desc: "A vetted agent from your class picks up and starts working." },
    { icon: FileText, title: "Get Deliverable", desc: "Review the submitted work and approve to release payment." },
    { icon: Banknote, title: "Payment Released", desc: "Funds are released to the agent once you're satisfied." },
  ];

  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 mb-4">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Simple Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Four simple steps to get your assignments done by verified campus agents.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center group">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:neon-glow-strong transition-shadow duration-300">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:-left-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <h3 className="text-base font-semibold mb-2">{step.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    { icon: BadgeCheck, title: "Verified Agents", desc: "Every agent is vetted with ID, sample work, and trial tasks before approval." },
    { icon: Clock, title: "Deadline Guaranteed", desc: "Set your deadline and get timely delivery — or your money back." },
    { icon: Lock, title: "Escrow Payments", desc: "Funds are held securely until you approve the deliverable." },
    { icon: Star, title: "Quality Reviews", desc: "Rate agents and track their performance with transparent metrics." },
    { icon: MessageCircle, title: "Built-in Chat", desc: "Communicate directly with your agent per assignment — no external apps." },
    { icon: Globe, title: "Multi-format Support", desc: "Upload and receive PDF, DOCX, PPTX, XLSX — any format you need." },
    { icon: ShoppingBag, title: "Campus Store", desc: "Order stationery and supplies delivered straight to your hostel." },
    { icon: TrendingUp, title: "Earn Money", desc: "Become an agent or explore curated earning opportunities." },
    { icon: Award, title: "Agent Badges", desc: "Top agents earn trusted badges and priority access to new tasks." },
  ];

  return (
    <section id="features" className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Full Platform</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">A complete campus marketplace — assignments, supplies, and earning opportunities.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <div key={i} className="card-hover rounded-xl border border-border bg-card p-6 group cursor-default" style={{ boxShadow: "var(--card-shadow)" }}>
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const storeItems = [
  { icon: BookOpen, name: "Notebooks" },
  { icon: Pencil, name: "Pens & Markers" },
  { icon: FlaskConical, name: "Lab Coats" },
  { icon: Calculator, name: "Calculators" },
];

const StorePreviewSection = () => (
  <section id="store" className="py-24">
    <div className="container mx-auto px-4 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 mb-4">
        <ShoppingBag className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">Shop Campus</span>
      </div>
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Campus Store</h2>
      <p className="text-muted-foreground max-w-lg mx-auto mb-12">Order stationery, textbooks, and supplies — delivered to your hostel.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        {storeItems.map((item, i) => (
          <div key={i} className="card-hover rounded-xl border border-border bg-card p-6 text-center" style={{ boxShadow: "var(--card-shadow)" }}>
            <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium">{item.name}</p>
          </div>
        ))}
      </div>
      <Button variant="outline" size="lg" className="mt-10">
        <ShoppingBag className="mr-2 h-4 w-4" />
        Browse Store <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  </section>
);

const EarnSection = () => (
  <section id="earn" className="py-24 bg-card/30">
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 mb-4">
          <DollarSign className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">Make Money</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Earn Money</h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-10">
          Join as an agent to earn from assignments, or explore our curated list of verified earning resources.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-hover rounded-xl border border-border bg-card p-8 text-left" style={{ boxShadow: "var(--card-shadow)" }}>
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <BadgeCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Become an Agent</h3>
            <ul className="space-y-2 text-sm text-muted-foreground mb-5">
              <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" /> Get verified with ID & sample work</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" /> Accept assignments for your class</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" /> Earn on your own schedule</li>
            </ul>
            <Button variant="hero" size="sm">
              <Rocket className="mr-1.5 h-4 w-4" />
              Apply Now
            </Button>
          </div>
          <div className="card-hover rounded-xl border border-border bg-card p-8 text-left" style={{ boxShadow: "var(--card-shadow)" }}>
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Earning Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground mb-5">
              <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" /> Curated & vetted opportunities</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" /> No scams — trust indicators</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" /> Updated regularly</li>
            </ul>
            <Button variant="outline" size="sm">
              <Globe className="mr-1.5 h-4 w-4" />
              Explore
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="py-24 pb-32 md:pb-24">
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsla(156,100%,44%,0.12),transparent_70%)]" />
        <div className="relative z-10">
          <Rocket className="h-10 w-10 text-primary mx-auto mb-4 animate-float" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to ace your assignments?</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Join hundreds of students who get their work done right — by verified humans.
          </p>
          <Button variant="hero" size="lg">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export { HeroSection, HowItWorksSection, FeaturesSection, StorePreviewSection, EarnSection, CTASection };
