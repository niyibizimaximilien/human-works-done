import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

const PrivacyPage = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-6 tap-highlight">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm">Last updated: April 2026</p>
        </div>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-lg font-heading font-semibold mb-2">1. Information We Collect</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We collect information you provide when creating an account, including your full name, email address, student ID number (format: 22XXXXXXX), phone number, university, department, level, and profile photo. We also collect assignment data, messages, payment proof images, and usage analytics.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-heading font-semibold mb-2">2. How We Use Your Information</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your information is used to: facilitate assignment matching between students and agents, process payments, verify identities, improve our services, send notifications about assignment status changes, and maintain platform security.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-heading font-semibold mb-2">3. Data Protection</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We implement industry-standard security measures including encrypted data transmission (TLS), row-level security policies on all database tables, and secure file storage. Payment proof images are stored securely and only accessible to authorized admin personnel.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-heading font-semibold mb-2">4. Contact Information Filtering</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To protect both students and agents, our platform automatically filters personal contact information (phone numbers, emails, social media handles) from in-app messages. This ensures all communication stays within the platform for safety and accountability.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-heading font-semibold mb-2">5. Data Sharing</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We do not sell or share your personal data with third parties. Agent profiles (name, university, ratings) are visible to students for selection purposes. Admin staff can view all platform data for quality assurance and dispute resolution.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-heading font-semibold mb-2">6. Data Retention</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your account data is retained as long as your account is active. Assignment data and associated files are retained for a minimum of 12 months after completion. You may request deletion of your account and associated data by contacting support.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-heading font-semibold mb-2">7. Your Rights</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You have the right to: access your personal data, correct inaccurate data, request deletion of your data, and withdraw consent for data processing. To exercise these rights, contact us at privacy@mrassignment.rw.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-heading font-semibold mb-2">8. Contact</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            For privacy-related inquiries, contact us at{" "}
            <a href="mailto:privacy@mrassignment.rw" className="text-primary hover:underline">privacy@mrassignment.rw</a>.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default PrivacyPage;
