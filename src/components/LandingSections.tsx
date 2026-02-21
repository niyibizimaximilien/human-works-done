import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload, CheckCircle, Shield, Clock, Lock, Users,
  ArrowRight, BadgeCheck, FileText, Briefcase,
  DollarSign, MessageCircle, Star
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => (
  <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-16">
    <div
      className="absolute inset-0 bg-cover bg-center opacity-20"
      style={{ backgroundImage: `url(${heroBg})` }}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
    <div className="relative z-10 container mx-auto px-4 text-center max-w-3xl">
      <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
        Get your assignments done by{" "}
        <span className="text-gradient-neon">verified agents</span>
      </h1>
      <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
        Post your assignment. A vetted agent from your campus picks it up, completes it, and delivers before deadline. Payment is held in escrow until you approve.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to="/auth">
          <Button variant="hero" size="lg">
            <Upload className="mr-2 h-5 w-5" />
            Submit an Assignment
          </Button>
        </Link>
        <Link to="/auth">
          <Button variant="outline" size="lg">
            <BadgeCheck className="mr-2 h-5 w-5" />
            Join as Agent
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

const WhatYouGetSection = () => {
  const forStudents = [
    { icon: Upload, title: "Post Assignments", desc: "Upload details, set deadline & budget. Agents see it instantly." },
    { icon: Shield, title: "Vetted Agents Only", desc: "Every agent is verified with ID and sample work before approval." },
    { icon: Lock, title: "Escrow Payments", desc: "Your money is held safely. Released only when you approve the work." },
    { icon: Clock, title: "Deadline Guarantee", desc: "Get your work on time or get a refund. No excuses." },
    { icon: MessageCircle, title: "Direct Chat", desc: "Talk to your agent in-app. Clarify details, track progress." },
    { icon: Star, title: "Rate & Review", desc: "Hold agents accountable with ratings after every delivery." },
  ];

  const forAgents = [
    { icon: Briefcase, title: "Pick Tasks", desc: "Browse open assignments. Accept the ones that match your skills." },
    { icon: DollarSign, title: "Earn Per Task", desc: "Get paid for every completed assignment. Withdraw anytime." },
    { icon: BadgeCheck, title: "Build Reputation", desc: "High ratings unlock priority access to higher-paying tasks." },
    { icon: FileText, title: "Deliver Work", desc: "Upload your deliverable. Student reviews and approves payment." },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* For Students */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold">For Students</h2>
          </div>
          <p className="text-muted-foreground mb-8 max-w-lg">Post your assignment and let someone qualified handle it.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {forStudents.map((f, i) => (
              <Card key={i} className="border-border bg-card" style={{ boxShadow: "var(--card-shadow)" }}>
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* For Agents */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold">For Agents</h2>
          </div>
          <p className="text-muted-foreground mb-8 max-w-lg">Earn money by completing assignments for students on your campus.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {forAgents.map((f, i) => (
              <Card key={i} className="border-border bg-card" style={{ boxShadow: "var(--card-shadow)" }}>
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
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
          <div key={i} className="flex flex-col items-center gap-3 p-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <t.icon className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">{t.label}</h3>
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
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Stop stressing over assignments</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Sign up, post your first assignment, and get it done by a verified agent today.
        </p>
        <Link to="/auth">
          <Button variant="hero" size="lg">
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export { HeroSection, WhatYouGetSection, TrustSection, CTASection };
