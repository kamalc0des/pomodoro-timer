import { byId } from "../utils/dom.js";
import { storage } from "../utils/storage.js";


if (!window._electronApiDeclared) {
  window._electronApiDeclared = true;
}

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
      if (msg) { 
        msg.textContent = "Settings saved ! Redirection...";
        await new Promise(res => setTimeout(res, 2000));
        window.electronAPI.navigate("timer.html");
      } 
    } else if (msg) {
      msg.textContent = "Invalid values";
    }
  };

  backBtn?.addEventListener("click", async () => {
    // await new Promise(res => setTimeout(res, 2000));
    window.electronAPI.navigate("timer.html");
  });
}
