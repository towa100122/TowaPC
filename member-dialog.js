import {
  escapeHtml,
  safeHttpUrl,
  safeImageSource,
  site,
} from "./site-data.js?v=73";
import { icon, textWithBreaks } from "./ui.js?v=73";

let previousFocus;

function closeDialog() {
  document.querySelector(".member-dialog-backdrop")?.remove();
  document.body.classList.remove("dialog-open");
  previousFocus?.focus();
  previousFocus = null;
}

function openDialog(item, trigger, kind) {
  closeDialog();
  previousFocus = trigger;
  const imageSource = safeImageSource(item.image);
  const url = safeHttpUrl(item.url);
  const label = kind === "partner" ? "Webサイト" : "プロフィール";
  const backdrop = document.createElement("div");
  backdrop.className = "member-dialog-backdrop";
  backdrop.innerHTML = `<section class="member-dialog ${kind}-dialog" role="dialog" aria-modal="true" aria-labelledby="member-dialog-title">
    <button class="member-dialog-close" type="button" aria-label="閉じる" data-member-dialog-close>${icon("close")}</button>
    ${imageSource ? `<img src="${escapeHtml(imageSource)}" alt="${escapeHtml(item.name)}" class="member-dialog-image">` : ""}
    <div class="member-dialog-copy">
      <h2 id="member-dialog-title">${escapeHtml(item.name)}</h2>
      <span class="category">${escapeHtml(item.role || "")}</span>
      <p>${textWithBreaks(item.description || "")}</p>
      ${url ? `<a class="cta dialog-link" href="${escapeHtml(url)}" target="_blank" rel="noopener">${label} ${icon("right")}</a>` : ""}
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

function classifyPartnerCard(card) {
  const image = card.querySelector(".company-logo");
  if (!image) return;
  const classify = () => {
    const ratio = image.naturalWidth / image.naturalHeight;
    card.classList.toggle("is-square", ratio >= 0.88 && ratio <= 1.12);
    card.classList.toggle("is-wide", ratio < 0.88 || ratio > 1.12);
  };
  if (image.complete) classify();
  else image.addEventListener("load", classify, { once: true });
}

export function setupMemberDialogs() {
  document.querySelectorAll("[data-member-index]").forEach((card) => {
    card.addEventListener("click", () => {
      const member = site.members[Number(card.dataset.memberIndex)];
      if (member) openDialog(member, card, "member");
    });
  });
  document.querySelectorAll("[data-partner-index]").forEach((card) => {
    classifyPartnerCard(card);
    card.addEventListener("click", () => {
      const partner = site.partners[Number(card.dataset.partnerIndex)];
      if (partner) openDialog(partner, card, "partner");
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
