import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone, Zap, WifiOff, Star } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show in iframe (Lovable preview)
    try {
      if (window.self !== window.top) return;
    } catch { return; }

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Check if previously dismissed (respect for 3 days)
    const dismissedAt = localStorage.getItem("pwa-dismissed");
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < 3 * 24 * 60 * 60 * 1000) return;

    // Detect iOS
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isiOS);

    // On iOS, show after 2s delay
    if (isiOS) {
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }

    // On Android/Desktop, listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowBanner(false);
    localStorage.setItem("pwa-dismissed", Date.now().toString());
  };

  if (!showBanner || dismissed) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[998] animate-fade-in"
        onClick={handleDismiss}
      />

      {/* Popup */}
      <div className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md z-[999] animate-slide-up">
        <div className="bg-card border border-border rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-muted/80 hover:bg-muted transition-colors z-10"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Header gradient */}
          <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 px-6 pt-8 pb-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-heading font-bold text-white mb-1">
              We're better on our app ✨
            </h3>
            <p className="text-sm text-white/80">
              Install MR. Assignment for the best experience
            </p>
          </div>

          {/* Benefits */}
          <div className="px-6 -mt-4">
            <div className="bg-background rounded-2xl border border-border p-4 space-y-3">
              {[
                { icon: Zap, text: "Lightning fast — opens instantly", color: "text-[hsl(var(--warn))]", bg: "bg-[hsl(var(--warn))]/10" },
                { icon: WifiOff, text: "Works even with poor connection", color: "text-[hsl(var(--info))]", bg: "bg-[hsl(var(--info))]/10" },
                { icon: Star, text: "Full-screen, no browser bars", color: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success))]/10" },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${b.bg} flex items-center justify-center shrink-0`}>
                    <b.icon className={`h-4 w-4 ${b.color}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{b.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="px-6 pt-5 pb-6 space-y-3">
            <Button
              onClick={handleInstall}
              size="lg"
              className="w-full h-13 text-base font-semibold gold-glow hover:animate-pulse-gold gap-2"
            >
              <Download className="h-5 w-5" />
              {isIOS ? "How to Install" : "Install App — It's Free"}
            </Button>
            <button
              onClick={handleDismiss}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>

      {/* iOS Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center">
          <div className="bg-card border border-border rounded-t-3xl md:rounded-3xl shadow-2xl w-full md:max-w-sm overflow-hidden">
            <div className="px-6 pt-6 pb-2">
              <h4 className="text-lg font-heading font-bold text-center mb-4">
                Install on iPhone/iPad
              </h4>
              <ol className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                  <span>Tap the <strong>Share</strong> button <span className="inline-block w-5 h-5 align-middle">⎙</span> at the bottom of Safari</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                  <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                  <span>Tap <strong>"Add"</strong> — that's it! 🎉</span>
                </li>
              </ol>
            </div>
            <div className="px-6 pt-4 pb-6">
              <Button onClick={() => { setShowIOSGuide(false); handleDismiss(); }} className="w-full">
                Got it!
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;
