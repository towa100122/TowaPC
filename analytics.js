(function prepareConsentBasedAnalytics() {
  const measurementId = "G-6FF3KH40W6";
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  window.enableTowaAnalytics = function enableTowaAnalytics() {
    window.gtag("consent", "update", { analytics_storage: "granted" });
    if (window.towaAnalyticsLoaded) return;
    window.towaAnalyticsLoaded = true;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.append(script);
    window.gtag("js", new Date());
    window.gtag("config", measurementId);
  };

  window.disableTowaAnalytics = function disableTowaAnalytics() {
    window.gtag("consent", "update", { analytics_storage: "denied" });
    document.cookie
      .split(";")
      .map((value) => value.split("=")[0].trim())
      .filter((name) => name.startsWith("_ga"))
      .forEach((name) => {
        document.cookie = `${name}=;Max-Age=0;path=/;SameSite=Lax`;
        document.cookie = `${name}=;Max-Age=0;path=/;domain=.towapc.com;SameSite=Lax`;
      });
  };
})();
