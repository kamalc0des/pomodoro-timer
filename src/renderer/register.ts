import { byId } from "../utils/dom.js";

if (!window._electronApiDeclared) {
  window._electronApiDeclared = true;
}

const savedTheme = localStorage.getItem("theme") ?? "retro-teal";
document.documentElement.dataset.theme = savedTheme;

const form = byId<HTMLFormElement>("registerForm");
if (!form) {
  // Do nothing
} else {
  const pseudoInput = byId<HTMLInputElement>("pseudo");
  const avatarInput = byId<HTMLInputElement>("avatar");
  const errorDiv = byId<HTMLDivElement>("error");
  const submitBtn = form.querySelector<HTMLButtonElement>("button[type='submit']");

  form.onsubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    const pseudo = (pseudoInput?.value ?? "").trim();
    const file: File | undefined = avatarInput?.files?.[0];

    if (!pseudo || !file) {
      if (errorDiv) errorDiv.textContent = "Pseudo and profile picture needed.";
      return;
    }

    // Loading...
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Loading...";
    }
    if (errorDiv) errorDiv.textContent = "";

    const reader = new FileReader();

    reader.onloadstart = () => {
      if (errorDiv) errorDiv.textContent = "Reading file...";
    };

    reader.onprogress = (evt) => {
      if (evt.lengthComputable && errorDiv) {
        const percent = Math.round((evt.loaded / evt.total) * 100);
        errorDiv.textContent = `Loading... ${percent}%`;
        errorDiv.className = "text-accent mt-4 text-sm";
      }
    };

    reader.onload = (evt: ProgressEvent<FileReader>) => {
      const result = evt.target?.result;
      if (typeof result === "string") {
        if (errorDiv) {
          errorDiv.textContent = "✅ Profile saved!";
          errorDiv.className = "text-green-500 mt-4 text-sm";
        }
        localStorage.setItem("pseudo", pseudo);
        localStorage.setItem("avatar", result);
        setTimeout(() => window.electronAPI.navigate("timer.html"), 800);
      } else {
        if (errorDiv) {
          errorDiv.textContent = "Impossible to read the file, please retry.";
          errorDiv.className = "text-red-500 mt-4 text-sm";
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Save";
        }
      }
    };

    reader.onerror = () => {
      if (errorDiv) {
        errorDiv.textContent = "Error reading file.";
        errorDiv.className = "text-red-500 mt-4 text-sm";
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Save";
      }
    };

    reader.readAsDataURL(file);
  };
}