import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Smartphone, Camera, Send, CheckCircle } from "lucide-react";
import { ReactNode } from "react";

const steps = [
  {
    icon: Smartphone,
    title: "Open Mobile Money",
    desc: "Open MTN MoMo or Airtel Money on your phone.",
    color: "text-[hsl(var(--warn))]",
    bg: "bg-[hsl(var(--warn))]/10",
  },
  {
    icon: Send,
    title: "Send Payment",
    desc: "Transfer the exact amount shown on your assignment to the number provided by admin.",
    color: "text-[hsl(var(--info))]",
    bg: "bg-[hsl(var(--info))]/10",
  },
  {
    icon: Camera,
    title: "Screenshot Confirmation",
    desc: "Take a clear screenshot of the transaction confirmation message.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: CheckCircle,
    title: "Upload Proof",
    desc: "Click 'Upload Payment Proof' on your assignment and upload the screenshot. Admin will verify and release your results.",
    color: "text-[hsl(var(--success))]",
    bg: "bg-[hsl(var(--success))]/10",
  },
];

const HowToPayGuide = ({ children }: { children: ReactNode }) => (
  <Dialog>
    <DialogTrigger asChild>{children}</DialogTrigger>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-heading">
          <CreditCard className="h-5 w-5 text-primary" /> How to Pay
        </DialogTitle>
        <DialogDescription>Step-by-step guide for mobile money payment.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 mt-2">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className={`w-9 h-9 rounded-xl ${step.bg} flex items-center justify-center shrink-0`}>
              <step.icon className={`h-4 w-4 ${step.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium">{step.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 rounded-lg bg-muted text-xs text-muted-foreground">
        <strong>Note:</strong> Payment is only requested after admin reviews and approves the completed work. Your results are released immediately after payment verification.
      </div>
    </DialogContent>
  </Dialog>
);

export default HowToPayGuide;
