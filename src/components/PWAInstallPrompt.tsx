import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  useEffect(() => {
    // Skip in iframes (Lovable preview)
    try {
      if (window.self !== window.top) return;
    } catch { return; }

    // Already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Dismissed recently (7 days)
    const dismissedAt = localStorage.getItem("pwa-dismissed");
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < 7 * 24 * 60 * 60 * 1000) return;

    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as Record<string, unknown>).MSStream;
    setIsIOS(ios);

    if (ios) {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSSteps(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("pwa-dismissed", Date.now().toString());
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-50 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {showIOSSteps ? (
          /* iOS instructions */
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
            <Button size="sm" variant="ghost" className="w-full text-xs" onClick={handleDismiss}>
              Got it
            </Button>
          </div>
        ) : (
          /* Main toast */
          <div className="flex items-center gap-3 p-4 pr-10">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-tight">
                We're better as an app
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Fast, offline-ready & full-screen
              </p>
            </div>
            <Button size="sm" onClick={handleInstall} className="shrink-0 text-xs h-8 px-3">
              Install
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
