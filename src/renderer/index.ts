import { byId } from "../utils/dom.js";

(function initIndexPage() {
  if (!window._electronApiDeclared) window._electronApiDeclared = true;

  console.log("[index] script loaded");

  const startBtn = byId<HTMLButtonElement>("startBtn");
  const resetAppBtn = byId<HTMLButtonElement>("resetAppBtn");
  const welcomeDiv = byId<HTMLDivElement>("welcome");

  // Get the profil and check if the user is logged in
  const storedPseudo = localStorage.getItem("pseudo");
  const storedAvatar = localStorage.getItem("avatar");
  const isLoggedIn = !!(storedPseudo && storedAvatar);

  if (!startBtn) {
    console.warn("[index] #startBtn not found");
    return;
  }

  if (!resetAppBtn) {
    console.warn("[index] #resetAppBtn not found");
    return;
  }

  // Show reset button only if logged in
  resetAppBtn.style.display = isLoggedIn ? "block" : "none";

  if (welcomeDiv) {
    if (isLoggedIn) {
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

  // Navigate to timer or register page on start
  startBtn.addEventListener("click", () => {
    startBtn.textContent = "Loading...";
    try {
      window.electronAPI?.navigate(isLoggedIn ? "timer.html" : "register.html");
    } catch (err) {
      console.error("[index] navigate error:", err);
    }
  });

  // Reset app data
  resetAppBtn.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });
})();