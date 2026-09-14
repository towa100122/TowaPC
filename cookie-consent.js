const COOKIE_CONSENT_KEY = "towapc-cookie-consent";

let cookieConsentObserver;

function readCookieConsent() {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY);
  } catch {
    return null;
  }
}

function saveCookieConsent(value) {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch {}
}

function hideCookieConsent(banner) {
  cookieConsentObserver?.disconnect();
  cookieConsentObserver = null;
  banner?.remove();
  document.body.classList.remove("cookie-consent-visible");
  document.body.style.removeProperty("--cookie-consent-height");
}

function showCookieConsent() {
  hideCookieConsent(document.querySelector(".cookie-consent"));
  const banner = document.createElement("aside");
  banner.className = "cookie-consent";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Cookieの利用について");
  banner.innerHTML = `<div>
    <strong>Cookieの利用について</strong>
    <p>サイト改善のため、同意後にGoogle Analyticsを使用します。拒否しても主要機能は利用できます。<a href="/privacy/">詳しく見る</a></p>
  </div>
  <div class="cookie-actions">
    <button type="button" data-cookie-reject>拒否する</button>
    <button type="button" data-cookie-accept>同意する</button>
  </div>`;
  document.body.append(banner);
  document.body.classList.add("cookie-consent-visible");

  const syncCookieSpace = () =>
    document.body.style.setProperty(
      "--cookie-consent-height",
      `${banner.offsetHeight}px`,
    );
  syncCookieSpace();
  cookieConsentObserver = new ResizeObserver(syncCookieSpace);
  cookieConsentObserver.observe(banner);

  banner.querySelector("[data-cookie-accept]").addEventListener("click", () => {
    saveCookieConsent("accepted");
    window.enableTowaAnalytics?.();
    hideCookieConsent(banner);
  });
  banner.querySelector("[data-cookie-reject]").addEventListener("click", () => {
    saveCookieConsent("rejected");
    window.disableTowaAnalytics?.();
    hideCookieConsent(banner);
  });
}

export function setupCookieConsent() {
  const consent = readCookieConsent();
  if (consent === "accepted") window.enableTowaAnalytics?.();
  else if (consent !== "rejected") showCookieConsent();
  document
    .querySelector("[data-cookie-settings]")
    ?.addEventListener("click", showCookieConsent);
}
