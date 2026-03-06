import { byId } from "../utils/dom.js";
import { storage } from "../utils/storage.js";

if (!window._electronApiDeclared) {
  window._electronApiDeclared = true;
}

// Theme management
const root = document.documentElement;
const themeButtons = document.querySelectorAll<HTMLButtonElement>(".theme-btn");

const saved = localStorage.getItem("theme") ?? "retro-teal";
root.dataset.theme = saved;
highlightActive(saved);

themeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const theme = btn.dataset.theme!;
    root.dataset.theme = theme;
    localStorage.setItem("theme", theme);
    highlightActive(theme);
  });
});

function highlightActive(theme: string) {
  themeButtons.forEach((btn) => {
    const isActive = btn.dataset.theme === theme;
    btn.classList.toggle("ring-2", isActive);
    btn.classList.toggle("ring-accent", isActive);
    btn.classList.toggle("bg-surface/40", isActive);
  });
}

// Reset app data
const resetAppBtnSettings = byId<HTMLButtonElement>("resetAppBtnSettings");
resetAppBtnSettings?.addEventListener("click", () => {
  localStorage.clear();
  location.reload();
  window.electronAPI.navigate("index.html");
});


// Settings form
const form = byId<HTMLFormElement>("settingsForm");
if (!form) {
  // Do nothing
} else {
  const durationInput = byId<HTMLInputElement>("duration");
  const cyclesInput = byId<HTMLInputElement>("cycles");
  const msg = byId<HTMLDivElement>("settingsMsg");
  const backBtn = byId<HTMLButtonElement>("backBtn");

  if (durationInput) durationInput.value = String(storage.getNumber("duration", 25));
  if (cyclesInput) cyclesInput.value = String(storage.getNumber("cycles", 4));

  form.onsubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    const newDuration = parseInt(durationInput?.value ?? "0", 10);
    const newCycles = parseInt(cyclesInput?.value ?? "0", 10);

    if (newDuration > 0 && newCycles > 0) {
      storage.set("duration", newDuration);
      storage.set("cycles", newCycles);

      const pageContent = byId<HTMLDivElement>("pageContent")!;
      pageContent.style.transition = "opacity 0.4s ease";
      pageContent.style.opacity = "0";

      await new Promise(res => setTimeout(res, 400));

      // 2. Afficher l'overlay (reste visible car pas affecté par le fade)
      const overlay = byId<HTMLDivElement>("savedOverlay")!;
      const icon = byId<HTMLDivElement>("savedIcon")!;
      const text = byId<HTMLParagraphElement>("savedText")!;

      overlay.style.transition = "opacity 0.4s ease";
      overlay.style.pointerEvents = "all";
      overlay.style.opacity = "1";

      await new Promise(res => setTimeout(res, 100));

      icon.style.transition = "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
      icon.style.transform = "scale(1)";

      text.style.transition = "opacity 0.4s ease";
      text.style.opacity = "1";

      await new Promise(res => setTimeout(res, 1500));
      window.electronAPI.navigate("timer.html");

      // 3. Pop de l'icône + fade du texte
      icon.style.transition = "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
      icon.style.transform = "scale(1)";

      text.style.transition = "opacity 0.4s ease";
      text.style.opacity = "1";

      // 4. Navigation
      await new Promise(res => setTimeout(res, 1500));
      window.electronAPI.navigate("timer.html");

    } else if (msg) {
      msg.textContent = "Invalid values";
    }
  };

  backBtn?.addEventListener("click", async () => {
    window.electronAPI.navigate("timer.html");
  });


}