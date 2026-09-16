import { escapeHtml } from "./site-data.js?v=72";

function inline(text) {
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let html = "";
  let offset = 0;
  for (const match of text.matchAll(pattern)) {
    html += escapeHtml(text.slice(offset, match.index));
    const source = match[2].trim();
    let url = "";
    try {
      const parsed = new URL(source, location.origin);
      if (["http:", "https:"].includes(parsed.protocol)) url = parsed.href;
    } catch {}
    if (url) {
      const external = new URL(url).origin !== location.origin;
      html += `<a href="${escapeHtml(url)}"${external ? ' target="_blank" rel="noopener"' : ""}>${escapeHtml(match[1])}</a>`;
    } else html += escapeHtml(match[1]);
    offset = match.index + match[0].length;
  }
  return html + escapeHtml(text.slice(offset));
}

export function renderLegalMarkdown(source) {
  const [body, meta = ""] = String(source || "")
    .replace(/\r/g, "")
    .split(/\n---\n/, 2);
  const output = [];
  let sectionOpen = false;
  let listOpen = false;
  const closeList = () => {
    if (listOpen) output.push("</ul>");
    listOpen = false;
  };
  for (const line of body.split("\n")) {
    const text = line.trim();
    if (!text) {
      closeList();
      continue;
    }
    if (text.startsWith("## ")) {
      closeList();
      if (sectionOpen) output.push("</section>");
      output.push(`<section><h2>${escapeHtml(text.slice(3))}</h2>`);
      sectionOpen = true;
    } else if (text.startsWith("- ")) {
      if (!listOpen) output.push("<ul>");
      listOpen = true;
      output.push(`<li>${inline(text.slice(2))}</li>`);
    } else {
      closeList();
      output.push(`<p>${inline(text)}</p>`);
    }
  }
  closeList();
  if (sectionOpen) output.push("</section>");
  const metaLines = meta
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (metaLines.length) {
    output.push(
      `<div class="legal-meta">${metaLines.map((line) => (line.startsWith("**") && line.endsWith("**") ? `<strong>${escapeHtml(line.slice(2, -2))}</strong>` : `<p>${inline(line)}</p>`)).join("")}</div>`,
    );
  }
  return output.join("");
}
