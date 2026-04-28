/**
 * Render a pixel-art icon with emoji fallback.
 *
 * If `iconPath` is defined, renders an <img> with image-rendering: pixelated.
 * If the image fails to load (404, missing), an inline onerror handler
 * replaces it with a <span> containing the fallback emoji.
 *
 * If `iconPath` is undefined, renders just the fallback emoji directly.
 */

export type IconSize = "sm" | "md" | "lg";

export interface RenderIconOptions {
  iconPath?: string;
  fallback: string;
  size: IconSize;
  alt?: string;
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function escapeJsString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export function renderIcon(opts: RenderIconOptions): string {
  const altText = escapeAttr(opts.alt ?? opts.fallback);
  const sizeClass = `pixel-icon-${opts.size}`;
  const fallbackClass = `pixel-fallback-${opts.size}`;

  if (opts.iconPath) {
    const fb = escapeJsString(opts.fallback);
    const onError = `this.replaceWith(Object.assign(document.createElement('span'),{textContent:'${fb}',className:'${fallbackClass}'}))`;
    return `<img src="${escapeAttr(opts.iconPath)}" alt="${altText}" class="pixel-icon ${sizeClass}" onerror="${escapeAttr(onError)}">`;
  }
  return `<span class="${fallbackClass}">${opts.fallback}</span>`;
}
