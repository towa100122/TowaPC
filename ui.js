import { escapeHtml, safeImageSource } from "./site-data.js";

const iconPaths = {
  bell: "M12 22a2.3 2.3 0 0 0 2.2-2h-4.4A2.3 2.3 0 0 0 12 22Zm7-6v-5a7 7 0 0 0-5-6.7V3a2 2 0 1 0-4 0v1.3A7 7 0 0 0 5 11v5l-2 2v1h18v-1Z",
  grid: "M3 3h8v8H3Zm10 0h8v8h-8ZM3 13h8v8H3Zm10 0h8v8h-8Z",
  list: "M4 5h3v3H4Zm5 0h11v3H9ZM4 10.5h3v3H4Zm5 0h11v3H9ZM4 16h3v3H4Zm5 0h11v3H9Z",
  right: "m9 5 7 7-7 7-1.4-1.4 4.6-4.6H3v-2h9.2L7.6 6.4Z",
  left: "m15 5-7 7 7 7 1.4-1.4-4.6-4.6H21v-2h-9.2l4.6-4.6Z",
  about: "M11 10h2v7h-2Zm0-3h2v2h-2Zm1-5a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z",
  mail: "M3 5h18v14H3Zm2 2v.5l7 4.5 7-4.5V7Zm14 10V9.8l-7 4.4-7-4.4V17Z",
  join: "M15 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM6 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm9 3c-3 0-6 1.5-6 4v2h12v-2c0-2.5-3-4-6-4ZM6 13c-2.4 0-5 1.2-5 3.5V19h6v-1c0-1.4.7-2.6 1.8-3.5A7 7 0 0 0 6 13Z",
  people:
    "M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8 13c-3.3 0-7 1.7-7 4.5V21h14v-3.5C15 14.7 11.3 13 8 13Zm8 .5c-.5 0-1 .1-1.5.2 1.5 1.1 2.5 2.6 2.5 4.3v3h6v-3c0-2.8-3.7-4.5-7-4.5Z",
  link: "M10.6 13.4a1 1 0 0 0 1.4 1.4l3.6-3.6a3 3 0 0 0-4.2-4.2L9.3 9.1 7.9 7.7 10 5.6a5 5 0 0 1 7.1 7.1l-3.7 3.7a3 3 0 0 1-4.2 0 1 1 0 0 1 0-1.4Zm2.8-2.8a1 1 0 0 0-1.4-1.4L8.4 12.8a3 3 0 1 0 4.2 4.2l2.1-2.1 1.4 1.4-2.1 2.1a5 5 0 1 1-7.1-7.1l3.7-3.7a3 3 0 0 1 4.2 0 1 1 0 0 1 0 1.4Z",
  palette:
    "M12 3a9 9 0 0 0 0 18h1.5a2.5 2.5 0 0 0 0-5H12a2 2 0 0 1 0-4h2a7 7 0 0 0 0-14Zm-5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z",
  motion: "M4 6h11v2H4Zm0 5h16v2H4Zm0 5h11v2H4Z",
  corners: "M4 4h7v2H6v5H4Zm9 0h7v7h-2V6h-5ZM4 13h2v5h5v2H4Zm14 0h2v7h-7v-2h5Z",
  density: "M4 5h16v2H4Zm0 6h16v2H4Zm0 6h16v2H4Z",
  sparkle:
    "m12 2 1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7Zm6 12 .9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9Z",
  reset: "M12 4a8 8 0 1 1-7.4 5H7L3.5 5.5 0 9h2.5A10 10 0 1 0 12 2Z",
  header: "M3 4h18v16H3Zm2 2v3h14V6Zm0 5v7h14v-7Z",
  upload: "M11 16h2V8.8l2.6 2.6L17 10l-5-5-5 5 1.4 1.4L11 8.8ZM4 18h16v2H4Z",
  close:
    "m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4Z",
  external:
    "M14 4h6v6h-2V7.4l-7.3 7.3-1.4-1.4L16.6 6H14ZM5 5h6v2H7v10h10v-4h2v6H5Z",
  popup:
    "M14 4h6v6h-2V7.4l-7.3 7.3-1.4-1.4L16.6 6H14ZM5 5h6v2H7v10h10v-4h2v6H5Z",
  file: "M6 2h8l5 5v15H6Zm8 2.5V8h3.5ZM8 12h8v2H8Zm0 4h8v2H8Z",
  download: "M11 3h2v10.2l3.6-3.6L18 11l-6 6-6-6 1.4-1.4 3.6 3.6ZM4 19h16v2H4Z",
};

export function icon(name) {
  const path = iconPaths[name] || iconPaths.grid;
  return `<span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="${path}"></path></svg></span>`;
}

export function brandIcon(name) {
  const safeName = escapeHtml(name);
  return `<img class="brand-icon brand-${safeName}" src="/assets/social-${safeName}.svg" alt="" aria-hidden="true">`;
}

export function image(source, alt, className = "") {
  const safeSource = safeImageSource(source);
  if (!safeSource) return "";
  const square = /directory|member|company/.test(className);
  const article = /article-image/.test(className);
  const width = square ? 512 : article ? 1200 : 640;
  const height = square ? 512 : article ? 675 : 400;
  return `<img class="${escapeHtml(className)}" src="${escapeHtml(safeSource)}" alt="${escapeHtml(alt)}" width="${width}" height="${height}" loading="lazy">`;
}

export function textWithBreaks(value) {
  return escapeHtml(String(value ?? "").replace(/\\n/g, "\n")).replace(
    /\r?\n/g,
    "<br>",
  );
}
