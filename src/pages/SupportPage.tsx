import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mail, MessageCircle, Clock, Shield } from "lucide-react";

const SupportPage = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-6 tap-highlight">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2">Support Center</h1>
        <p className="text-muted-foreground">We're here to help. Reach out through any of the channels below.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardContent className="p-6 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading font-semibold">Email Support</h3>
            <p className="text-sm text-muted-foreground">Send us a detailed message and we'll respond within 24 hours.</p>
            <a href="mailto:support@mrassignment.rw">
              <Button variant="outline" size="sm" className="tap-highlight">support@mrassignment.rw</Button>
            </a>
          </CardContent>
        </Card>

        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardContent className="p-6 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading font-semibold">In-App Chat</h3>
            <p className="text-sm text-muted-foreground">Use the assignment chat to communicate directly with your agent.</p>
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="tap-highlight">Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardContent className="p-6 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading font-semibold">Response Times</h3>
            <p className="text-sm text-muted-foreground">We aim to respond to all inquiries within 24 hours during business days.</p>
            <p className="text-xs text-muted-foreground">Mon–Fri, 8:00 AM – 6:00 PM CAT</p>
          </CardContent>
        </Card>

        <Card className="border-border" style={{ boxShadow: "var(--card-shadow)" }}>
          <CardContent className="p-6 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading font-semibold">Report an Issue</h3>
            <p className="text-sm text-muted-foreground">Found a bug or have a security concern? Let us know immediately.</p>
            <a href="mailto:security@mrassignment.rw">
              <Button variant="outline" size="sm" className="tap-highlight">Report Issue</Button>
            </a>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 text-center">
        <p className="text-sm text-muted-foreground">
          Check our <Link to="/faq" className="text-primary hover:underline">FAQ</Link> for quick answers to common questions.
        </p>
      </div>
    </div>
  </div>
);

export default SupportPage;
