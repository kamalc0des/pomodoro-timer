import { t } from "./i18n.js";

export interface RhythmValues {
  duration: number;
  breakDuration: number;
  cycles: number;
}

export interface RhythmPickerHandle {
  values: RhythmValues;
  refresh: () => void;
}

interface SliderConfig {
  id: keyof RhythmValues;
  labelKey: string;
  unit: "min" | "";
  min: number;
  max: number;
  step: number;
}

const CONFIGS: SliderConfig[] = [
  { id: "duration", labelKey: "settings.duration", unit: "min", min: 1, max: 60, step: 1 },
  { id: "breakDuration", labelKey: "settings.break", unit: "min", min: 2, max: 20, step: 2 },
  { id: "cycles", labelKey: "settings.cycles", unit: "", min: 2, max: 4, step: 1 },
];

function snap(value: number, step: number, min: number, max: number): number {
  const clamped = Math.max(min, Math.min(max, value));
  return Math.round((clamped - min) / step) * step + min;
}

export function mountRhythmPicker(
  container: HTMLElement,
  initial: RhythmValues,
  onChange: (next: RhythmValues) => void,
): RhythmPickerHandle {
  const values: RhythmValues = {
    duration: snap(initial.duration, 1, 1, 60),
    breakDuration: snap(initial.breakDuration, 2, 2, 20),
    cycles: snap(initial.cycles, 1, 2, 4),
  };

  container.innerHTML = "";
  const valueSpans: Record<string, HTMLSpanElement> = {};

  CONFIGS.forEach((cfg) => {
    const wrapper = document.createElement("label");
    wrapper.className = "flex flex-col gap-1 w-full max-w-[14rem] mx-auto";

    const head = document.createElement("span");
    head.className = "text-xs text-muted flex justify-between";
    const labelEl = document.createElement("span");
    labelEl.dataset.i18n = cfg.labelKey;
    labelEl.textContent = t(cfg.labelKey);
    const valueEl = document.createElement("span");
    valueEl.textContent = `${values[cfg.id]}${cfg.unit ? ` ${cfg.unit}` : ""}`;
    valueSpans[cfg.id] = valueEl;
    head.appendChild(labelEl);
    head.appendChild(valueEl);

    const input = document.createElement("input");
    input.type = "range";
    input.min = String(cfg.min);
    input.max = String(cfg.max);
    input.step = String(cfg.step);
    input.value = String(values[cfg.id]);
    input.className = "accent-accent";
    input.dataset.field = cfg.id;
    input.addEventListener("input", () => {
      const v = parseInt(input.value, 10);
      values[cfg.id] = v;
      valueEl.textContent = `${v}${cfg.unit ? ` ${cfg.unit}` : ""}`;
      onChange({ ...values });
    });

    wrapper.appendChild(head);
    wrapper.appendChild(input);
    container.appendChild(wrapper);
  });

  function refresh() {
    CONFIGS.forEach((cfg) => {
      const span = valueSpans[cfg.id];
      if (span) span.textContent = `${values[cfg.id]}${cfg.unit ? ` ${cfg.unit}` : ""}`;
    });
  }

  return { values, refresh };
}
