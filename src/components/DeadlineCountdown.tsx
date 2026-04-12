import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

const DeadlineCountdown = ({ deadline }: { deadline: string }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const diff = new Date(deadline).getTime() - now;
  if (diff <= 0) return (
    <span className="text-destructive text-xs font-medium flex items-center gap-1">
      <AlertTriangle className="h-3 w-3" /> Overdue
    </span>
  );

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  const urgent = diff < 3600000 * 4; // less than 4 hours
  const label = days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <span className={`text-xs font-medium flex items-center gap-1 ${urgent ? "text-destructive" : "text-warn"}`}>
      <Clock className="h-3 w-3" /> {label} left
    </span>
  );
};

export default DeadlineCountdown;
