"use client";

import { useEffect } from "react";

export function GoogleTranslateProvider() {
  useEffect(() => {
    // Hide Google's toolbar/banner — we use our own toggle
    const style = document.createElement("style");
    style.id = "goog-translate-hide";
    style.textContent = `
      .goog-te-banner-frame { display: none !important; }
      .goog-te-balloon-frame { display: none !important; }
      .skiptranslate { display: none !important; }
      .goog-te-spinner-pos { display: none !important; }
      body { top: 0 !important; }
      /* Preserve font rendering after translation */
      font[face] { font-family: inherit !important; }
      font[face] > * { font-family: inherit !important; }
    `;
    document.head.appendChild(style);

    // Google Translate init callback
    (window as any).googleTranslateElementInit = function () {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "es",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    // Load Google Translate script
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div id="google_translate_element" style={{ display: "none" }} aria-hidden="true" />
  );
}
