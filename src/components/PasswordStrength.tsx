import { useMemo } from "react";

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const { score, label, color } = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "" };
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^a-zA-Z0-9]/.test(password)) s++;

    const levels = [
      { label: "Very weak", color: "bg-destructive" },
      { label: "Weak", color: "bg-destructive" },
      { label: "Fair", color: "bg-[hsl(var(--warn))]" },
      { label: "Good", color: "bg-[hsl(var(--info))]" },
      { label: "Strong", color: "bg-[hsl(var(--success))]" },
      { label: "Very strong", color: "bg-[hsl(var(--success))]" },
    ];
    return { score: s, ...levels[s] };
  }, [password]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < score ? color : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className={`text-[10px] ${score <= 1 ? "text-destructive" : score <= 2 ? "text-[hsl(var(--warn))]" : "text-muted-foreground"}`}>
        {label}
      </p>
    </div>
  );
};

export default PasswordStrength;
