import {
  escapeHtml,
  safeHttpUrl,
  safeImageSource,
  site,
} from "./site-data.js?v=73";
import { icon, textWithBreaks } from "./ui.js?v=73";

let previousFocus;

function destination(value) {
  const first = String(value || "")
    .replace(/\\n/g, "\n")
    .split(/;;|\r?\n/)[0];
  const separator = first.indexOf("|");
  return separator > 0 ? safeHttpUrl(first.slice(separator + 1).trim()) : "";
}

function closeDialog() {
  document.querySelector(".project-dialog-backdrop")?.remove();
  document.body.classList.remove("dialog-open");
  previousFocus?.focus();
  previousFocus = null;
}

function openDialog(project, trigger) {
  closeDialog();
  previousFocus = trigger;
  const imageSource = safeImageSource(project.image);
  const url = destination(project.links);
  const backdrop = document.createElement("div");
  backdrop.className = "project-dialog-backdrop";
  backdrop.innerHTML = `<section class="project-dialog" role="dialog" aria-modal="true" aria-labelledby="project-dialog-title">
    <button class="project-dialog-close" type="button" aria-label="閉じる" data-project-dialog-close>${icon("close")}</button>
    ${imageSource ? `<img src="${escapeHtml(imageSource)}" alt="${escapeHtml(project.name)}" class="project-dialog-image">` : ""}
    <div class="project-dialog-copy">
      <h2 id="project-dialog-title">${escapeHtml(project.name)}</h2>
      <span class="category">${escapeHtml(project.category || "")}</span>
      <p>${textWithBreaks(project.description || "")}</p>
      ${url ? `<a class="project-dialog-move" href="${escapeHtml(url)}" target="_blank" rel="noopener">プロジェクトに移動 ${icon("right")}</a>` : '<span class="project-dialog-move is-disabled">リンク準備中</span>'}
    </div>
  </section>`;
  document.body.append(backdrop);
  document.body.classList.add("dialog-open");
  backdrop.querySelector("[data-project-dialog-close]").focus();
  backdrop.addEventListener("click", (event) => {
    if (
      event.target === backdrop ||
      event.target.closest("[data-project-dialog-close]")
    )
      closeDialog();
  });
}

export function setupProjectDialogs() {
  document.querySelectorAll("[data-project-id]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const project = site.products.find(
        (item) => item.id === trigger.dataset.projectId,
      );
      if (project) openDialog(project, trigger);
    });
  });
}

export function handleProjectDialogEscape(event) {
  if (
    event.key !== "Escape" ||
    !document.querySelector(".project-dialog-backdrop")
  )
    return false;
  closeDialog();
  return true;
}
