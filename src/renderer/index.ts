import { byId } from"../utils/dom.js"; 

(function initIndexPage() {
  if (!window._electronApiDeclared) window._electronApiDeclared = true;

  console.log("[index] script loaded"); // sanity check

  const startBtn = byId<HTMLButtonElement>("startBtn");
  const resetAppBtn = byId<HTMLButtonElement>("resetAppBtn");

  if (!startBtn) {
    console.warn("[index] #startBtn not found");
    return;
  }

  if (!resetAppBtn) {
    console.warn("[index] #resetAppBtn not found");
    return;
  }

  const welcomeDiv = byId<HTMLDivElement>("welcome");
  const storedPseudo = localStorage.getItem("pseudo");
  const storedAvatar = localStorage.getItem("avatar");

  if(welcomeDiv) {
    if (storedPseudo && storedAvatar) {
      welcomeDiv.innerHTML = `
        <img src="${storedAvatar}" class="w-20 h-20 rounded-full mb-3 shadow-lg border-2 border-accent" alt="Avatar" />
        <h2 class="text-xl font-bold">Welcome back, ${storedPseudo} !</h2>
        <p class="text-sm text-muted mt-1">Ready to focus?</p>
      `;
    } else {
      welcomeDiv.innerHTML = `
        <h2 class="text-xl font-bold">Welcome on Pomodoro Minutor !</h2>
        <p class="text-sm text-muted mt-1">Create your profile to get started.</p>
      `;
    }
  }

  startBtn.addEventListener("click", () => {
    startBtn.textContent = "Loading..."; // visual proof
    try {
      if (!storedPseudo || !storedAvatar) {
        window.electronAPI?.navigate("register.html");
      } else {
        window.electronAPI?.navigate("timer.html");
      }
    } catch (err) {
      console.error("[index] navigate error:", err);
    }
  });

  resetAppBtn.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });
})();
