import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload, CheckCircle, Shield, Clock, Lock, Users,
  ArrowRight, BadgeCheck, FileText, Briefcase,
  MessageCircle, Star, Sparkles
} from "lucide-react";

const HeroSection = () => (
  <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-16">
    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/8 rounded-full blur-[150px]" />
    <div className="relative z-10 container mx-auto px-4 text-center max-w-3xl">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-8 animate-fade-in">
        <Sparkles className="h-3.5 w-3.5" />
        Trusted by students across Rwanda
      </div>
      <h1 className="text-4xl md:text-6xl font-heading font-extrabold leading-tight tracking-tight mb-6 animate-slide-up">
        Get your assignments done by{" "}
        <span className="text-gradient-gold">verified agents</span>
      </h1>
      <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: "200ms" }}>
        Post your assignment. A vetted agent picks it up, completes it, and delivers before deadline. Payment held in escrow until you approve.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "400ms" }}>
        <Link to="/auth">
          <Button size="lg" className="gold-glow hover:animate-pulse-gold h-12 px-8 font-semibold text-base tap-highlight">
            <Upload className="mr-2 h-5 w-5" />
            Submit an Assignment
          </Button>
        </Link>
        <Link to="/auth">
          <Button variant="outline" size="lg" className="h-12 px-8 tap-highlight">
            <BadgeCheck className="mr-2 h-5 w-5" />
            Get Started Free
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

const HowItWorksSection = () => {
  const steps = [
    { num: "01", title: "Post Assignment", desc: "Upload your brief with deadline and budget. Attach your PDF document.", icon: Upload },
    { num: "02", title: "Agent Works On It", desc: "A vetted agent picks up your task and starts working immediately.", icon: Briefcase },
    { num: "03", title: "Admin Reviews", desc: "Completed work goes to admin review for quality assurance.", icon: Shield },
    { num: "04", title: "Pay & Receive", desc: "After admin approval, pay via mobile money and download your results.", icon: CheckCircle },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-card/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground max-w-md mx-auto">Four simple steps from posting to receiving your completed assignment.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <span className="text-xs text-primary font-mono font-bold">{step.num}</span>
              <h3 className="font-heading font-semibold mt-1 mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-7 -right-3 w-6">
                  <ArrowRight className="h-4 w-4 text-primary/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const WhatYouGetSection = () => {
  const forStudents = [
    { icon: Upload, title: "Post Assignments", desc: "Upload details, set deadline & budget. Agents see it instantly." },
    { icon: Shield, title: "Vetted Agents Only", desc: "Every agent is verified with ID and sample work before approval." },
    { icon: Lock, title: "Escrow Payments", desc: "Your money is held safely. Released only when you approve the work." },
    { icon: Clock, title: "Deadline Guarantee", desc: "Get your work on time or get a refund. No excuses." },
    { icon: MessageCircle, title: "Direct Communication", desc: "Attach additional documents for clarification anytime." },
    { icon: Star, title: "Rate & Review", desc: "Hold agents accountable with ratings after every delivery." },
  ];

  const forAgents = [
    { icon: Briefcase, title: "Pick Tasks", desc: "Browse open assignments. Accept the ones that match your skills." },
    { icon: Sparkles, title: "Earn Per Task", desc: "Get paid in RWF for every completed assignment. Withdraw anytime." },
    { icon: BadgeCheck, title: "Build Reputation", desc: "High ratings unlock priority access to higher-paying tasks." },
    { icon: FileText, title: "Deliver Work", desc: "Upload your deliverable. Student reviews and approves payment." },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div id="students" className="mb-20 scroll-mt-20">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-2xl md:text-3xl font-heading font-bold">For Students</h2>
          </div>
          <p className="text-muted-foreground mb-8 max-w-lg">Post your assignment and let someone qualified handle it.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {forStudents.map((f, i) => (
              <Card key={i} className="border-border bg-card card-hover animate-fade-in" style={{ boxShadow: "var(--card-shadow)", animationDelay: `${i * 100}ms` }}>
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div id="agents" className="scroll-mt-20">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <h2 className="text-2xl md:text-3xl font-heading font-bold">For Agents</h2>
          </div>
          <p className="text-muted-foreground mb-8 max-w-lg">Earn money by completing assignments for students.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {forAgents.map((f, i) => (
              <Card key={i} className="border-border bg-card card-hover animate-fade-in" style={{ boxShadow: "var(--card-shadow)", animationDelay: `${i * 100}ms` }}>
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const TrustSection = () => (
  <section className="py-16 bg-card/30">
    <div className="container mx-auto px-4 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        {[
          { icon: Shield, label: "100% Human Work", sub: "No AI-generated content. Real people, real quality." },
          { icon: Lock, label: "Escrow Protected", sub: "Funds locked until you approve. Zero risk." },
          { icon: CheckCircle, label: "Verified Agents", sub: "ID-checked, sample-tested, and trial-approved." },
        ].map((t, i) => (
          <div key={i} className="flex flex-col items-center gap-3 p-6 animate-fade-in" style={{ animationDelay: `${i * 120}ms` }}>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <t.icon className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-lg">{t.label}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{t.sub}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="py-20 pb-32 md:pb-20">
    <div className="container mx-auto px-4">
      <div className="max-w-2xl mx-auto rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-10 md:p-14 text-center">
        <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3">Stop stressing over assignments</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Sign up, post your first assignment, and get it done by a verified agent today.
        </p>
        <Link to="/auth">
          <Button size="lg" className="gold-glow hover:animate-pulse-gold h-12 px-8 font-semibold tap-highlight">
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export { HeroSection, HowItWorksSection, WhatYouGetSection, TrustSection, CTASection };
