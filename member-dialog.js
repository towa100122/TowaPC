import {
  escapeHtml,
  safeHttpUrl,
  safeImageSource,
  site,
} from "./site-data.js?v=72";
import { icon, textWithBreaks } from "./ui.js?v=72";

let previousFocus;

function closeDialog() {
  document.querySelector(".member-dialog-backdrop")?.remove();
  document.body.classList.remove("dialog-open");
  previousFocus?.focus();
  previousFocus = null;
}

function openDialog(member, trigger) {
  closeDialog();
  previousFocus = trigger;
  const imageSource = safeImageSource(member.image);
  const url = safeHttpUrl(member.url);
  const backdrop = document.createElement("div");
  backdrop.className = "member-dialog-backdrop";
  backdrop.innerHTML = `<section class="member-dialog" role="dialog" aria-modal="true" aria-labelledby="member-dialog-title">
    <button class="member-dialog-close" type="button" aria-label="閉じる" data-member-dialog-close>${icon("close")}</button>
    ${imageSource ? `<img src="${escapeHtml(imageSource)}" alt="${escapeHtml(member.name)}" class="member-dialog-image">` : ""}
    <div class="member-dialog-copy">
      <span class="category">${escapeHtml(member.role || "")}</span>
      <h2 id="member-dialog-title">${escapeHtml(member.name)}</h2>
      <p>${textWithBreaks(member.description || "")}</p>
      ${url ? `<a class="text-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">Webサイト ${icon("right")}</a>` : ""}
    </div>
  </section>`;
  document.body.append(backdrop);
  document.body.classList.add("dialog-open");
  backdrop.querySelector("[data-member-dialog-close]").focus();
  backdrop.addEventListener("click", (event) => {
    if (
      event.target === backdrop ||
      event.target.closest("[data-member-dialog-close]")
    ) {
      closeDialog();
    }
  });
}

export function setupMemberDialogs() {
  document.querySelectorAll("[data-member-index]").forEach((card) => {
    card.addEventListener("click", () => {
      const member = site.members[Number(card.dataset.memberIndex)];
      if (member) openDialog(member, card);
    });
  });
}

export function handleMemberDialogEscape(event) {
  if (
    event.key !== "Escape" ||
    !document.querySelector(".member-dialog-backdrop")
  ) {
    return false;
  }
  closeDialog();
  return true;
}
