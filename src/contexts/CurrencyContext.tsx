import React, { createContext, useContext, useState, useEffect } from "react";
import type { Currency } from "@/lib/pricing";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  isAutoDetected: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "USD",
  setCurrency: () => {},
  isAutoDetected: false,
});

export const useCurrency = () => useContext(CurrencyContext);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [isAutoDetected, setIsAutoDetected] = useState(false);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        if (data?.country_code === "IN") {
          setCurrency("INR");
        }
        setIsAutoDetected(true);
      })
      .catch(() => setIsAutoDetected(true));
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, isAutoDetected }}>
      {children}
    </CurrencyContext.Provider>
  );
}
