import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/pricing";
import { AlertTriangle, Play, Crown, Lock } from "lucide-react";
import type { Currency, DurationTier } from "@/lib/pricing";

interface PreviewState {
  prompt: string;
  duration: DurationTier;
  currency: Currency;
  price: number;
}

export default function Preview() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PreviewState | null;

  if (!state) {
    navigate("/studio");
    return null;
  }

  const { prompt, duration, currency, price } = state;

  const handlePayment = () => {
    // In production, this would open Razorpay checkout
    // For now, simulate payment success
    navigate("/download", { state: { prompt, duration, currency, price } });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-3xl pt-24 pb-16">
        <h1 className="font-display text-3xl font-bold text-center mb-8">Preview Your Video</h1>

        {/* Video Player Mock */}
        <div className="relative aspect-video rounded-xl border border-border bg-secondary overflow-hidden mb-6">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <Play className="h-8 w-8 text-primary" />
              </div>
              <p className="text-lg font-display font-semibold text-foreground/80">Demo Preview</p>
              <p className="text-sm text-muted-foreground mt-1">420p • 2 min preview</p>
            </div>
          </div>

          {/* Quality badge */}
          <Badge className="absolute top-3 left-3 bg-destructive/80 text-destructive-foreground">
            420p DEMO
          </Badge>

          {/* Watermark overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <p className="font-display text-6xl font-bold rotate-[-30deg] text-foreground">
              AVATAR AI
            </p>
          </div>
        </div>

        {/* Demo Warning */}
        <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 mb-6">
          <AlertTriangle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">This is a demo video</p>
            <p className="text-sm text-muted-foreground">
              After payment, the full-length video will be available in stunning 4K quality.
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold">Order Summary</h2>

          <div className="space-y-2 text-sm">
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
            <div className="border-t border-border pt-2 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatPrice(price, currency)}</span>
            </div>
          </div>

          <Button
            className="w-full h-14 text-lg font-semibold glow-purple glow-pulse"
            onClick={handlePayment}
          >
            <Lock className="mr-2 h-5 w-5" />
            Pay {formatPrice(price, currency)} with Razorpay
          </Button>
        </div>
      </div>
    </div>
  );
}
