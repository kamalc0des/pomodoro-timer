import { byId } from "../utils/dom.js";

if (!window._electronApiDeclared) {
  window._electronApiDeclared = true;
}

const form = byId<HTMLFormElement>("registerForm");
if (!form) {
  // Do nothing
} else {
  const pseudoInput = byId<HTMLInputElement>("pseudo");
  const avatarInput = byId<HTMLInputElement>("avatar");
  const errorDiv = byId<HTMLDivElement>("error");

  form.onsubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    const pseudo = (pseudoInput?.value ?? "").trim();
    const file: File | undefined = avatarInput?.files?.[0];

    if (!pseudo || !file) {
      if (errorDiv) errorDiv.textContent = "Pseudo and profile picture needed.";
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt: ProgressEvent<FileReader>) => {
      const result = evt.target?.result;
      if (typeof result === "string") {
        localStorage.setItem("pseudo", pseudo);
        localStorage.setItem("avatar", result);
        window.electronAPI.navigate("timer.html");
      } else if (errorDiv) {
        errorDiv.textContent = "Impossible to read the file, please retry.";
      }
    };
    reader.readAsDataURL(file);
  };
}
