import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/pricing";
import { Crown, Lock, Shield } from "lucide-react";

interface OrderSummaryProps {
  prompt: string;
  duration: string;
  currency: string;
  price: number;
  onPay: () => void;
}

export function OrderSummary({ prompt, duration, currency, price, onPay }: OrderSummaryProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <h2 className="font-display text-lg font-semibold">Order Summary</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Prompt</span>
          <span className="max-w-[60%] text-right truncate">{prompt}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Duration</span>
          <span>{duration} min</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Quality</span>
          <span className="flex items-center gap-1">
            <Crown className="h-3 w-3 text-primary" /> 4K Ultra HD
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Voice</span>
          <span>AI Professional Narration</span>
        </div>
        <div className="border-t border-border pt-3 flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span className="text-primary">{formatPrice(price, currency)}</span>
        </div>
      </div>

      <Button
        className="w-full h-14 text-lg font-semibold glow-purple glow-pulse"
        onClick={onPay}
      >
        <Lock className="mr-2 h-5 w-5" />
        Pay {formatPrice(price, currency)} with Razorpay
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-3 w-3" />
        <span>Secure payment · Money-back guarantee</span>
      </div>
    </div>
  );
}
