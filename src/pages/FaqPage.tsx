import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "How does MR.ASSIGNMENT work?",
    a: "You post your assignment with a deadline and budget, choose a verified agent, and they complete it for you. Once the admin reviews the work, you pay via mobile money and receive your results.",
  },
  {
    q: "How do I pay for an assignment?",
    a: "Payments are handled in Rwandan Francs (RWF). After your agent submits the work and the admin reviews it, you'll be notified to upload payment proof (screenshot of mobile money transfer). Once the admin verifies the payment, your results are released.",
  },
  {
    q: "Can I become an agent?",
    a: "Yes! All users sign up as students first. From your dashboard, you can request to become an agent. An admin will review your application and approve you if qualified.",
  },
  {
    q: "What if the work isn't good quality?",
    a: "All work goes through an admin review before you're asked to pay. If there are quality issues, the admin can request revisions or transfer the assignment to another agent.",
  },
  {
    q: "Is my payment safe?",
    a: "Yes. We use an escrow-style system — your payment proof is only accepted after the work is reviewed and approved by our admin team. Results are only released after payment verification.",
  },
  {
    q: "Can I communicate with my agent?",
    a: "Yes, each assignment has a built-in chat where you can discuss details with your agent. For privacy and security, sharing personal contact information in messages is not allowed.",
  },
  {
    q: "What file formats are accepted?",
    a: "You can upload PDF, DOC, DOCX, TXT, PPT, PPTX, XLS, XLSX, JPG, PNG, GIF, ZIP, and RAR files as assignment briefs or deliverables.",
  },
  {
    q: "What is the Student ID format?",
    a: "Your Student ID must start with 22 followed by 7 digits (e.g., 220000001). This is required during onboarding for verification purposes.",
  },
  {
    q: "Can an assignment be transferred to another agent?",
    a: "Yes, the admin can transfer an assignment to a different agent if needed. You'll be notified if this happens, and you can see the transfer status on your assignment.",
  },
  {
    q: "How are agents rated?",
    a: "After receiving your completed work, you can rate your agent (1–5 stars) and indicate whether the work was delivered on time. These ratings help future students choose the best agents.",
  },
];

const FaqPage = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-6 tap-highlight">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <HelpCircle className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Frequently Asked Questions</h1>
          <p className="text-muted-foreground text-sm">Everything you need to know about MR.ASSIGNMENT.</p>
        </div>
      </div>

      <Accordion type="single" collapsible className="mt-8 space-y-2">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-lg px-4 data-[state=open]:bg-card transition-colors">
            <AccordionTrigger className="text-sm font-medium hover:no-underline py-4">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground mb-3">Still have questions?</p>
        <a href="mailto:support@mrassignment.rw">
          <Button variant="outline" className="tap-highlight">Contact Support</Button>
        </a>
      </div>
    </div>
  </div>
);

export default FaqPage;
