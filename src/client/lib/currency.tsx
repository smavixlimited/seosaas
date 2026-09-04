import * as React from "react";
import { Icon } from "@iconify/react";

export type Currency =
  | "USD"
  | "NGN"
  | "EUR"
  | "GBP"
  | "GHS"
  | "KES"
  | "ZAR"
  | "CAD"
  | "AUD"
  | "UGX"
  | "TZS"
  | "RWF"
  | "XOF"
  | "XAF";

export interface CurrencyConfig {
  code: Currency;
  name: string;
  symbol: string;
  flag: string;
  rateAgainstUsd: number; // 1 USD = X Currency
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", rateAgainstUsd: 1.0 },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", rateAgainstUsd: 1550 },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", rateAgainstUsd: 0.92 },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", rateAgainstUsd: 0.78 },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵", flag: "🇬🇭", rateAgainstUsd: 15.2 },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪", rateAgainstUsd: 129.0 },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦", rateAgainstUsd: 18.4 },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", flag: "🇨🇦", rateAgainstUsd: 1.36 },
  { code: "AUD", name: "Australian Dollar", symbol: "AU$", flag: "🇦🇺", rateAgainstUsd: 1.52 },
  { code: "UGX", name: "Ugandan Shilling", symbol: "USh", flag: "🇺🇬", rateAgainstUsd: 3700 },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", flag: "🇹🇿", rateAgainstUsd: 2600 },
  { code: "RWF", name: "Rwandan Franc", symbol: "RF", flag: "🇷🇼", rateAgainstUsd: 1350 },
  { code: "XOF", name: "West African CFA", symbol: "CFA", flag: "🇸🇳", rateAgainstUsd: 600 },
  { code: "XAF", name: "Central African CFA", symbol: "FCFA", flag: "🇨🇲", rateAgainstUsd: 600 },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amountUSD: number, amountNGN?: number) => string;
  symbol: string;
  currentCurrencyInfo: CurrencyConfig;
}

const CurrencyContext = React.createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
  formatPrice: (usd) => `$${usd}`,
  symbol: "$",
  currentCurrencyInfo: SUPPORTED_CURRENCIES[0],
});

const CURRENCY_STORAGE_KEY = "skorvia_currency_pref";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = React.useState<Currency>(() => {
    if (typeof window === "undefined") return "USD";
    try {
      const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY) as Currency | null;
      if (stored && SUPPORTED_CURRENCIES.some((c) => c.code === stored)) {
        return stored;
      }

      // Detect user time zone / locale
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (timeZone.includes("Lagos") || timeZone.includes("Africa/Lagos") || navigator.language.includes("NG")) {
        return "NGN";
      }
      if (timeZone.includes("London") || timeZone.includes("Europe/London")) {
        return "GBP";
      }
      if (timeZone.includes("Europe") || timeZone.includes("Paris") || timeZone.includes("Berlin")) {
        return "EUR";
      }
      if (timeZone.includes("Accra")) {
        return "GHS";
      }
      if (timeZone.includes("Nairobi")) {
        return "KES";
      }
      if (timeZone.includes("Johannesburg")) {
        return "ZAR";
      }
    } catch {
      // Ignore localStorage error
    }
    return "USD";
  });

  const setCurrency = React.useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, c);
    } catch {
      // Ignore
    }
  }, []);

  const currentCurrencyInfo = React.useMemo(() => {
    return SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0];
  }, [currency]);

  const formatPrice = React.useCallback(
    (amountUSD: number, amountNGN?: number) => {
      if (currency === "USD") {
        return `$${amountUSD.toLocaleString()}`;
      }
      if (currency === "NGN") {
        const ngnVal = amountNGN != null ? amountNGN : Math.round(amountUSD * 1550);
        return `₦${ngnVal.toLocaleString()}`;
      }

      const info = SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0];
      const converted = Math.round(amountUSD * info.rateAgainstUsd);
      return `${info.symbol}${converted.toLocaleString()}`;
    },
    [currency]
  );

  const symbol = currentCurrencyInfo.symbol;

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, symbol, currentCurrencyInfo }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return React.useContext(CurrencyContext);
}

export function CurrencySwitcher({ className = "" }: { className?: string }) {
  return <CurrencyDropdown className={className} />;
}

export function CurrencyDropdown({ className = "" }: { className?: string }) {
  const { currency, setCurrency, currentCurrencyInfo } = useCurrency();
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
        <span>{currentCurrencyInfo.flag}</span>
        <span className="font-extrabold text-[11px]">{currentCurrencyInfo.code} ({currentCurrencyInfo.symbol})</span>
        <Icon
          icon="solar:alt-arrow-down-linear"
          className={`h-3 w-3 transition-transform duration-200 opacity-60 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-base-300 bg-base-100 p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-base-content/50 border-b border-base-200">
            Select Currency
          </div>
          {SUPPORTED_CURRENCIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => {
                setCurrency(c.code);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                currency === c.code
                  ? "bg-primary/10 text-primary font-black"
                  : "text-base-content/80 hover:bg-base-200 hover:text-base-content"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{c.flag}</span>
                <span>{c.code} ({c.symbol})</span>
                <span className="text-[10px] text-base-content/50 font-normal">{c.name}</span>
              </div>
              {currency === c.code && (
                <Icon icon="solar:check-circle-bold" className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
