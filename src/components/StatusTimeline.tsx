import { CheckCircle, Clock, CreditCard, FileText, Send, Unlock } from "lucide-react";

const STEPS = [
  { key: "created", label: "Created", icon: FileText },
  { key: "in_progress", label: "In Progress", icon: Clock },
  { key: "submitted", label: "Submitted", icon: Send },
  { key: "pending_payment", label: "Payment", icon: CreditCard },
  { key: "released", label: "Released", icon: Unlock },
  { key: "completed", label: "Completed", icon: CheckCircle },
];

function getActiveIndex(assignment: any): number {
  if (assignment.admin_released || assignment.status === "completed") return 5;
  if (assignment.payment_status === "paid") return 4;
  if (assignment.payment_status === "pending_payment") return 3;
  if (assignment.status === "submitted") return 2;
  if (assignment.status === "in_progress") return 1;
  return 0;
}

const StatusTimeline = ({ assignment }: { assignment: any }) => {
  const activeIdx = getActiveIndex(assignment);

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {STEPS.map((step, i) => {
        const done = i <= activeIdx;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center gap-1">
            <div className={`flex flex-col items-center gap-1 min-w-[56px] ${done ? "text-primary" : "text-muted-foreground/40"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                done ? "bg-primary/15 border border-primary/30" : "bg-muted/50 border border-border"
              }`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-[9px] font-medium text-center leading-tight">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-4 shrink-0 rounded-full mt-[-16px] ${i < activeIdx ? "bg-primary/40" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;
