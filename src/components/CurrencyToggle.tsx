import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center rounded-full border border-border bg-secondary p-0.5">
      <Button
        variant={currency === "INR" ? "default" : "ghost"}
        size="sm"
        className="h-7 rounded-full px-3 text-xs"
        onClick={() => setCurrency("INR")}
      >
        ₹ INR
      </Button>
      <Button
        variant={currency === "USD" ? "default" : "ghost"}
        size="sm"
        className="h-7 rounded-full px-3 text-xs"
        onClick={() => setCurrency("USD")}
      >
        $ USD
      </Button>
    </div>
  );
}
