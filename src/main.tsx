import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Remove PWA splash screen after React mounts
requestAnimationFrame(() => {
  const splash = document.getElementById("pwa-splash");
  if (splash) {
    splash.style.opacity = "0";
    setTimeout(() => splash.remove(), 400);
  }
});
