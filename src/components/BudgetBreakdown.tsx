import { formatRWF } from "@/lib/contactFilter";

interface BudgetBreakdownProps {
  materialCost?: number;
  serviceFee?: number;
  platformFee?: number;
  totalBudget?: number;
  compact?: boolean;
}

const BudgetBreakdown = ({ materialCost = 0, serviceFee = 0, platformFee = 0, totalBudget }: BudgetBreakdownProps) => {
  const hasBreakdown = materialCost > 0 || serviceFee > 0 || platformFee > 0;
  const total = totalBudget || (materialCost + serviceFee + platformFee);

  if (!hasBreakdown && !totalBudget) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payment Breakdown</p>
      {hasBreakdown ? (
        <>
          {materialCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Materials</span>
              <span>{formatRWF(materialCost)}</span>
            </div>
          )}
          {serviceFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service fee</span>
              <span>{formatRWF(serviceFee)}</span>
            </div>
          )}
          {platformFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform fee</span>
              <span>{formatRWF(platformFee)}</span>
            </div>
          )}
          <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span className="text-primary">{formatRWF(total)}</span>
          </div>
        </>
      ) : (
        <div className="flex justify-between text-sm font-semibold">
          <span>Total Budget</span>
          <span className="text-primary">{formatRWF(total)}</span>
        </div>
      )}
    </div>
  );
};

export default BudgetBreakdown;
