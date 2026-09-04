import * as React from "react";
import { Icon } from "@iconify/react";

export type SupportedLanguage =
  | "en"
  | "es"
  | "fr"
  | "de"
  | "pt"
  | "ar"
  | "zh"
  | "ja"
  | "yo"
  | "ha"
  | "ig";

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  dir?: "ltr" | "rtl";
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: "en", name: "English", nativeName: "English (US)", flag: "🇺🇸", dir: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹", dir: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇦🇪", dir: "rtl" },
  { code: "zh", name: "Chinese", nativeName: "简体中文", flag: "🇨🇳", dir: "ltr" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", dir: "ltr" },
  { code: "yo", name: "Yoruba", nativeName: "Èdè Yorùbá", flag: "🇳🇬", dir: "ltr" },
  { code: "ha", name: "Hausa", nativeName: "Harshen Hausa", flag: "🇳🇬", dir: "ltr" },
  { code: "ig", name: "Igbo", nativeName: "Asụsụ Igbo", flag: "🇳🇬", dir: "ltr" },
];

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  currentLanguageInfo: LanguageInfo;
}

const LanguageContext = React.createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  currentLanguageInfo: SUPPORTED_LANGUAGES[0],
});

const LANGUAGE_STORAGE_KEY = "skorvia_language_pref";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<SupportedLanguage>(() => {
    if (typeof window === "undefined") return "en";
    try {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage | null;
      if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
        return stored;
      }
      const browserLang = navigator.language?.split("-")[0] as SupportedLanguage;
      if (SUPPORTED_LANGUAGES.some((l) => l.code === browserLang)) {
        return browserLang;
      }
    } catch {
      // Ignore
    }
    return "en";
  });

  const setLanguage = React.useCallback((l: SupportedLanguage) => {
    setLanguageState(l);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, l);
      document.documentElement.lang = l;
      const info = SUPPORTED_LANGUAGES.find((item) => item.code === l);
      if (info?.dir) {
        document.documentElement.dir = info.dir;
      }
    } catch {
      // Ignore
    }
  }, []);

  const currentLanguageInfo = React.useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, currentLanguageInfo }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return React.useContext(LanguageContext);
}

export function LanguageDropdown({ className = "" }: { className?: string }) {
  const { language, setLanguage, currentLanguageInfo } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-xl border border-base-300 bg-base-200/50 hover:bg-base-200 px-3 py-1.5 text-xs font-bold text-base-content transition-all shadow-xs"
        aria-expanded={isOpen}
      >
        <span>{currentLanguageInfo.flag}</span>
        <span className="hidden sm:inline font-extrabold uppercase text-[11px]">
          {currentLanguageInfo.code}
        </span>
        <Icon
          icon="solar:alt-arrow-down-linear"
          className={`h-3 w-3 transition-transform duration-200 opacity-60 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-base-300 bg-base-100 p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-base-content/50 border-b border-base-200">
            Select Language
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                language === lang.code
                  ? "bg-primary/10 text-primary font-black"
                  : "text-base-content/80 hover:bg-base-200 hover:text-base-content"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </div>
              {language === lang.code && (
                <Icon icon="solar:check-circle-bold" className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
