import { escapeHtml, safeImageSource } from "./site-data.js?v=72";

const iconNames = {
  bell: "notifications",
  grid: "grid_view",
  list: "view_list",
  right: "arrow_forward",
  left: "arrow_back",
  about: "info",
  mail: "mail",
  join: "group_add",
  people: "group",
  link: "link",
  palette: "palette",
  motion: "animation",
  corners: "rounded_corner",
  density: "density_medium",
  sparkle: "auto_awesome",
  reset: "restart_alt",
  header: "web_asset",
  upload: "upload_file",
  close: "close",
};

export function icon(name) {
  const symbol = iconNames[name] || iconNames.grid;
  return `<span class="material-symbols-rounded icon" aria-hidden="true">${symbol}</span>`;
}

export function brandIcon(name) {
  const safeName = escapeHtml(name);
  return `<img class="brand-icon brand-${safeName}" src="/assets/social-${safeName}.svg" alt="" aria-hidden="true">`;
}

export function image(source, alt, className = "") {
  const safeSource = safeImageSource(source);
  if (!safeSource) return "";
  return `<img class="${escapeHtml(className)}" src="${escapeHtml(safeSource)}" alt="${escapeHtml(alt)}" loading="lazy">`;
}

export function textWithBreaks(value) {
  return escapeHtml(String(value ?? "").replace(/\\n/g, "\n")).replace(
    /\r?\n/g,
    "<br>",
  );
}
