import { useState, useEffect } from "react";
import { X, Download, Share, Smartphone, Zap, WifiOff, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const PWAInstallPrompt = () => {
  const { canInstall, isIOS, promptInstall } = usePWAInstall();
  const [show, setShow] = useState(false);
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  useEffect(() => {
    // Skip in iframes
    try { if (window.self !== window.top) return; } catch { return; }
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const dismissedAt = localStorage.getItem("pwa-dismissed");
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < 7 * 24 * 60 * 60 * 1000) return;

    const timer = setTimeout(() => {
      if (canInstall) setShow(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, [canInstall]);

  const handleInstall = async () => {
    if (isIOS) { setShowIOSSteps(true); return; }
    await promptInstall();
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("pwa-dismissed", Date.now().toString());
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-50 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        <button onClick={handleDismiss} className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors" aria-label="Dismiss">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {showIOSSteps ? (
          <div className="p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">Add to Home Screen</p>
            <ol className="text-xs text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <Share className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                <span>Tap the <strong className="text-foreground">Share</strong> button in Safari</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-3.5 h-3.5 mt-0.5 shrink-0 rounded bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">+</span>
                <span>Tap <strong className="text-foreground">"Add to Home Screen"</strong></span>
              </li>
            </ol>
            <Button size="sm" variant="ghost" className="w-full text-xs" onClick={handleDismiss}>Got it</Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 pr-10">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">We're better as an app</p>
              <p className="text-xs text-muted-foreground mt-0.5">Fast, offline-ready & full-screen</p>
            </div>
            <Button size="sm" onClick={handleInstall} className="shrink-0 text-xs h-8 px-3">Install</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstallPrompt;

/* Reusable install section for Settings / pages */
export function PWAInstallSection() {
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  if (isInstalled) {
    return (
      <div className="rounded-2xl border border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5 p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[hsl(var(--success))]/10 flex items-center justify-center shrink-0">
          <Smartphone className="h-6 w-6 text-[hsl(var(--success))]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">App Installed ✓</p>
          <p className="text-xs text-muted-foreground">You're using MR. Assignment as an app. Enjoy!</p>
        </div>
      </div>
    );
  }

  const handleClick = async () => {
    if (isIOS) { setShowIOSSteps(!showIOSSteps); return; }
    await promptInstall();
  };

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-transparent to-accent/5 p-5 space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Smartphone className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-base font-heading font-bold text-foreground">Install MR. Assignment</p>
          <p className="text-sm text-muted-foreground mt-1">Get the full app experience right on your phone's home screen.</p>
        </div>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Zap, label: "Lightning fast", desc: "Opens instantly", color: "text-[hsl(var(--warn))]", bg: "bg-[hsl(var(--warn))]/10" },
          { icon: WifiOff, label: "Works offline", desc: "Poor connection? No problem", color: "text-[hsl(var(--info))]", bg: "bg-[hsl(var(--info))]/10" },
          { icon: Maximize2, label: "Full screen", desc: "No browser bars", color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success))]/10" },
        ].map((b) => (
          <div key={b.label} className="flex items-center gap-2.5 rounded-xl bg-card border border-border p-3">
            <div className={`w-8 h-8 rounded-lg ${b.bg} flex items-center justify-center shrink-0`}>
              <b.icon className={`h-4 w-4 ${b.color}`} />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">{b.label}</p>
              <p className="text-[10px] text-muted-foreground">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {canInstall && (
        <Button onClick={handleClick} className="gold-glow hover:animate-pulse-gold gap-2">
          <Download className="h-4 w-4" />
          {isIOS ? "How to Install" : "Install App — Free"}
        </Button>
      )}

      {showIOSSteps && (
        <div className="rounded-xl bg-card border border-border p-4 space-y-2 text-sm">
          <p className="font-semibold">On iPhone / iPad:</p>
          <ol className="space-y-1.5 text-muted-foreground text-xs">
            <li>1. Tap the <strong className="text-foreground">Share</strong> button in Safari</li>
            <li>2. Scroll and tap <strong className="text-foreground">"Add to Home Screen"</strong></li>
            <li>3. Tap <strong className="text-foreground">"Add"</strong> — done! 🎉</li>
          </ol>
        </div>
      )}
    </div>
  );
}
