import React, { createContext, useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router-dom";

const LanguageContext = createContext({
  lang: "en",
  toggleLanguage: () => {},
});

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
  const location = useLocation();

  useEffect(() => {
    i18n.changeLanguage(lang);
    document.documentElement.lang = lang;

    // detect ATM routes
    const isATMPage =
      location.pathname.includes("atm") ||
      location.pathname.includes("atm-dashboard");

    // Apply RTL only for Arabic (NOT for English or Hindi)
    if (lang === "ar" && !isATMPage) {
      document.documentElement.setAttribute("dir", "rtl");
      document.body.classList.add("rtl");
    } else {
      document.documentElement.setAttribute("dir", "ltr");
      document.body.classList.remove("rtl");
    }

    localStorage.setItem("lang", lang);
  }, [lang, i18n, location.pathname]);

  const toggleLanguage = (lng) => setLang(lng);

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage }}>
      <Outlet />
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
