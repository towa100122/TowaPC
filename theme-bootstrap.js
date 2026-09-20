(function applyStoredThemeBeforePaint() {
  const root = document.documentElement;
  const systemTheme = matchMedia("(prefers-color-scheme:dark)").matches
    ? "dark"
    : "light";
  try {
    const settings = JSON.parse(
      localStorage.getItem("towapc-appearance-v1") || "{}",
    );
    const pinnedTheme = ["light", "dark"].includes(settings.theme)
      ? settings.theme
      : systemTheme;
    const temporaryTheme = sessionStorage.getItem("towapc-temporary-theme");
    root.dataset.theme =
      settings.themePinned === true
        ? pinnedTheme
        : ["light", "dark"].includes(temporaryTheme)
          ? temporaryTheme
          : systemTheme;
    document
      .querySelector("[data-theme-color]")
      ?.setAttribute(
        "content",
        root.dataset.theme === "dark" ? "#24261d" : "#f5e6ac",
      );
    root.dataset.themePinned = settings.themePinned === true ? "on" : "off";
    root.dataset.accent = settings.accent || "standard";
    root.dataset.surface = settings.surface || "standard";
    root.dataset.corners = settings.corners || "soft";
    root.dataset.density = settings.density || "comfortable";
    root.dataset.glass = settings.glass === false ? "off" : "on";
    root.dataset.headerMotion = settings.headerMotion || "slide";
    root.style.setProperty(
      "--custom-accent",
      settings.customColor || "#ffff99",
    );
    root.style.setProperty(
      "--header-opacity",
      `${100 - (settings.headerTransparency ?? 42)}%`,
    );
    root.style.setProperty("--header-blur", `${settings.headerBlur ?? 14}px`);
    root.style.setProperty(
      "--header-duration",
      `${settings.headerDuration ?? 480}ms`,
    );
  } catch {
    root.dataset.theme = systemTheme;
    document
      .querySelector("[data-theme-color]")
      ?.setAttribute("content", systemTheme === "dark" ? "#24261d" : "#f5e6ac");
  }
})();
