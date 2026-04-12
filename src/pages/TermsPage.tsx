import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";

const TermsPage = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-6 tap-highlight">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Terms of Service</h1>
          <p className="text-muted-foreground text-sm">Last updated: April 2026</p>
        </div>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-lg font-heading font-semibold mb-2">1. Acceptance of Terms</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            By creating an account on MR.ASSIGNMENT, you agree to be bound by these Terms of Service. If you do not agree, do not use our platform. You must be at least 18 years old or a registered university student to use our services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-heading font-semibold mb-2">2. User Accounts</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All users register as students. To become an agent, you must apply through your dashboard and receive admin approval. You are responsible for maintaining the security of your account credentials. A valid Student ID (format: 22XXXXXXX) and profile photo are required during onboarding.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-heading font-semibold mb-2">3. Assignment Submissions</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Students post assignments with clear briefs, deadlines, and budgets. Agents accept and complete work within the agreed timeframe. All assignments are subject to admin review before results are released.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-heading font-semibold mb-2">4. Payments</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All payments are in Rwandan Francs (RWF). Payment is collected via mobile money after work completion and admin approval. Students must upload valid payment proof. Results are released only after payment verification by our admin team. We operate an escrow-style model to protect both parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-heading font-semibold mb-2">5. Communication Rules</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All communication between students and agents must happen through the in-app messaging system. Sharing personal contact information (phone numbers, emails, social media) is prohibited and automatically filtered. Violations may result in account suspension.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-heading font-semibold mb-2">6. Content Ownership</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Students retain ownership of their assignment briefs. Agents retain no rights to completed work after delivery and payment. MR.ASSIGNMENT does not claim ownership of any user-generated content.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-heading font-semibold mb-2">7. Prohibited Activities</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Users must not: share personal contact information to circumvent the platform, submit fraudulent payment proofs, impersonate other users, upload malicious files, or use the platform for illegal activities. Violations will result in immediate account termination.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-heading font-semibold mb-2">8. Transfers & Disputes</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Admins may transfer assignments between agents when necessary. Students are notified of transfers and can see transfer reasons. For disputes, contact our admin team who will mediate and resolve issues fairly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-heading font-semibold mb-2">9. Limitation of Liability</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            MR.ASSIGNMENT acts as a platform connecting students with agents. We are not responsible for the quality of work beyond our admin review process. Our liability is limited to the amount paid for any disputed assignment.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-heading font-semibold mb-2">10. Contact</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Questions about these terms? Contact us at{" "}
            <a href="mailto:legal@mrassignment.rw" className="text-primary hover:underline">legal@mrassignment.rw</a>.
          </p>
        </section>
      </div>
    </div>
  </div>
);

export default TermsPage;
