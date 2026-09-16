import {
  appearanceSettings,
  applyAppearance,
  disableAnimationMode,
  renderAppearanceLab,
  setupAppearanceControls,
  setupAppearanceEgg,
  setupTheme,
} from "./appearance-settings.js?v=71";
import { setupCookieConsent } from "./cookie-consent.js?v=71";
import { setupShredEgg } from "./easter-eggs.js?v=71";
import {
  handleMemberDialogEscape,
  setupMemberDialogs,
} from "./member-dialog.js?v=71";
import {
  productResults,
  productView,
  renderFooterContacts,
  renderFooterLinks,
  renderPage,
  routes,
} from "./page-views.js?v=71";
import {
  handleProjectDialogEscape,
  setupProjectDialogs,
} from "./project-dialog.js?v=71";
import { loadSiteData, safeImageSource, site } from "./site-data.js?v=71";
import { icon } from "./ui.js?v=71";

const headerRoutes = [
  ["", "Home"],
  ["product", "Product"],
  ["information", "Information"],
  ["about", "About"],
  ["contact", "Contact"],
];

function headerNavigation() {
  const links = headerRoutes
    .map(
      ([path, label]) =>
        `<a href="/${path ? `${path}/` : ""}" data-route="${path}">${label}</a>`,
    )
    .join("");
  return `<span class="nav-selection"></span>${links}`;
}

function currentLocation() {
  const parts = location.pathname.split("/").filter(Boolean);
  return { route: parts[0] || "", id: parts[1] || "" };
}

function pageTitle(route) {
  const specialTitles = {
    appearance: "Appearance Lab",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
  };
  return (
    specialTitles[route] ||
    routes.find(([path]) => path === `/${route}`)?.[1] ||
    (route ? "Not found" : "Home")
  );
}

function renderNavigation(route) {
  const nav = document.querySelector(".header nav");
  if (!nav.querySelector("[data-route]")) nav.innerHTML = headerNavigation();
  nav.querySelectorAll("[data-route]").forEach((link) => {
    link.classList.toggle("active", link.dataset.route === route);
  });
  document.querySelector("[data-footer-links]").innerHTML = renderFooterLinks();
  document.querySelector("[data-footer-contact]").innerHTML =
    renderFooterContacts();
}

function resetMenu() {
  const nav = document.querySelector(".header nav");
  const button = document.querySelector(".menu-button");
  nav.classList.remove("open");
  document.body.classList.remove("menu-open");
  document.body.style.removeProperty("--menu-scroll-y");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-label", "メニューを開く");
  button.querySelector(".material-symbols-rounded").textContent = "menu";
}

function filterProducts(button) {
  document.querySelectorAll("[data-filter]").forEach((candidate) => {
    candidate.classList.toggle("active", candidate === button);
    candidate.setAttribute("aria-pressed", String(candidate === button));
  });
  const view =
    document.querySelector("[data-product-view].active")?.dataset.productView ||
    productView();
  const items = site.products.filter(
    (product) =>
      button.dataset.filter === "all" || product.type === button.dataset.filter,
  );
  document.getElementById("product-results").innerHTML = productResults(
    items,
    view,
  );
  setupProjectDialogs();
  reveal();
}

function switchProductView(button) {
  document.querySelectorAll("[data-product-view]").forEach((candidate) => {
    candidate.classList.toggle("active", candidate === button);
    candidate.setAttribute("aria-pressed", String(candidate === button));
  });
  try {
    localStorage.setItem("towapc-product-view", button.dataset.productView);
  } catch {}
  const filter =
    document.querySelector("[data-filter].active")?.dataset.filter || "all";
  const items = site.products.filter(
    (product) => filter === "all" || product.type === filter,
  );
  document.getElementById("product-results").innerHTML = productResults(
    items,
    button.dataset.productView,
  );
  setupProjectDialogs();
  reveal();
}

function setupPageControls() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => filterProducts(button));
  });
  document.querySelectorAll("[data-product-view]").forEach((button) => {
    button.addEventListener("click", () => switchProductView(button));
  });
  setupMemberDialogs();
  setupProjectDialogs();
  setupAppearanceEgg(navigate);
  setupAppearanceControls(render);
  setupShredEgg();
}

function render() {
  const { route, id } = currentLocation();
  const main = document.getElementById("main");
  const content = renderPage(route, id, renderAppearanceLab);
  const homeLink = route
    ? `<div class="page-home-link wrap"><a class="text-link" href="/">${icon("left")} ホームに戻る</a></div>`
    : "";
  main.innerHTML = content + homeLink;
  document.title = `TowaPC — ${pageTitle(route)}`;

  const logo = safeImageSource(site.logo) || "/assets/TowaPC.svg";
  document.querySelectorAll(".custom-logo").forEach((image) => {
    image.setAttribute("src", logo);
  });
  renderNavigation(route);
  resetMenu();
  setupPageControls();
  window.scrollTo({ top: 0, behavior: "instant" });
  reveal();
  main.classList.remove("page-enter");
  void main.offsetWidth;
  main.classList.add("page-enter");
  requestAnimationFrame(positionSelection);
}

function navigate(path) {
  if (location.pathname !== path) history.pushState(null, "", path);
  render();
}

function showDataWarning(failures) {
  if (!failures.length) return;
  const warning = document.createElement("aside");
  warning.className = "data-warning";
  warning.setAttribute("role", "status");
  warning.textContent =
    "一部の情報を読み込めませんでした。時間を置いて再読み込みしてください。";
  document.getElementById("main").prepend(warning);
}

async function start() {
  const failures = await loadSiteData();
  render();
  showDataWarning(failures);
}

let menuScrollY = 0;

function setMenuLock(open) {
  if (open) {
    menuScrollY = window.scrollY;
    document.body.style.setProperty("--menu-scroll-y", `${menuScrollY}px`);
    document.body.classList.add("menu-open");
    return;
  }
  document.body.classList.remove("menu-open");
  document.body.style.removeProperty("--menu-scroll-y");
  window.scrollTo({ top: menuScrollY, behavior: "instant" });
}

function setMenuState(open) {
  const nav = document.querySelector(".header nav");
  const button = document.querySelector(".menu-button");
  nav.classList.toggle("open", open);
  setMenuLock(open);
  button.setAttribute("aria-expanded", String(open));
  button.setAttribute(
    "aria-label",
    open ? "メニューを閉じる" : "メニューを開く",
  );
  button.querySelector(".material-symbols-rounded").textContent = open
    ? "close"
    : "menu";
}

let observer;

function reveal() {
  observer?.disconnect();
  const items = [...document.querySelectorAll(".floating,.section-heading")];
  if (
    matchMedia("(prefers-reduced-motion:reduce)").matches ||
    appearanceSettings.motion === "none"
  ) {
    items.forEach((element) => {
      element.classList.add("reveal", "is-visible");
      element.classList.remove("play-reveal");
    });
    return;
  }
  const current = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        target.style.setProperty(
          "--reveal-delay",
          `${target.dataset.revealDelay || 0}ms`,
        );
        target.classList.add("is-visible", "play-reveal");
        target.addEventListener(
          "animationend",
          () => target.classList.remove("play-reveal"),
          { once: true },
        );
        current.unobserve(target);
      });
    },
    { threshold: 0.08 },
  );
  observer = current;
  items.forEach((element, index) => {
    element.classList.remove("is-visible", "play-reveal");
    element.classList.add("reveal");
    element.dataset.revealDelay = String(
      (index % 4) * appearanceSettings.stagger,
    );
  });
  requestAnimationFrame(() => {
    if (observer === current)
      items.forEach((element) => current.observe(element));
  });
}

function positionSelection() {
  const nav = document.querySelector(".header nav");
  if (!nav) return;
  const selected = nav.querySelector(
    ":scope>a.active,:scope>details.active-group>summary",
  );
  const pill = nav.querySelector(".nav-selection");
  if (!pill) return;
  if (!selected || !nav.offsetWidth) {
    pill.style.opacity = "0";
    return;
  }
  pill.style.opacity = "1";
  pill.style.width = `${selected.offsetWidth}px`;
  pill.style.height = `${selected.offsetHeight}px`;
  pill.style.transform = `translate(${selected.offsetLeft}px,${selected.offsetTop}px)`;
  requestAnimationFrame(() => nav.classList.add("nav-ready"));
}

function migrateLegacyHash() {
  if (location.hash.startsWith("#/")) {
    history.replaceState(null, "", location.hash.slice(1).replace(/\/?$/, "/"));
  }
}

document.querySelector(".menu-button").addEventListener("click", () => {
  const nav = document.querySelector(".header nav");
  setMenuState(!nav.classList.contains("open"));
});

document.addEventListener("click", (event) => {
  const nav = document.querySelector(".header nav");
  if (
    nav.classList.contains("open") &&
    !event.target.closest(".header nav") &&
    !event.target.closest(".menu-button")
  ) {
    setMenuState(false);
  }
});

document.querySelector(".back-top").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (
    !link ||
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    link.target
  ) {
    return;
  }
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin) return;
  event.preventDefault();
  const nextPath =
    url.pathname === "/" ? "/" : url.pathname.replace(/\/?$/, "/");
  navigate(nextPath);
  if (url.hash) {
    requestAnimationFrame(() => {
      document.querySelector(url.hash)?.scrollIntoView({ behavior: "smooth" });
    });
  }
});

window.addEventListener("resize", positionSelection);
window.addEventListener("popstate", () => {
  migrateLegacyHash();
  render();
});
window.addEventListener("hashchange", () => {
  migrateLegacyHash();
  render();
});
document.addEventListener("keydown", (event) => {
  if (handleMemberDialogEscape(event)) return;
  if (handleProjectDialogEscape(event)) return;
  if (event.key === "Escape") disableAnimationMode();
});

document.fonts.ready.then(positionSelection);
applyAppearance();
setupTheme();
setupCookieConsent();
migrateLegacyHash();
start();
