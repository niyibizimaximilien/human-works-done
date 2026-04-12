import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <Card className="border-border border-dashed" style={{ boxShadow: "none" }}>
    <CardContent className="py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto mb-5 animate-float">
        <Icon className="h-8 w-8 text-primary/40" />
      </div>
      <h3 className="font-heading font-semibold text-base mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </CardContent>
  </Card>
);

export default EmptyState;
