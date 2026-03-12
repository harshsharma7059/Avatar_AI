import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PRICING, DURATION_LABELS, formatPrice, type DurationTier } from "@/lib/pricing";
import { Sparkles, Loader2 } from "lucide-react";

const TIERS: DurationTier[] = ["1-5", "5-15", "15+"];

export default function Studio() {
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState<DurationTier>("1-5");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    // Simulate AI generation (5-8s)
    const delay = 5000 + Math.random() * 3000;
    setTimeout(() => {
      setGenerating(false);
      navigate("/preview", {
        state: { prompt, duration, currency, price: PRICING[duration][currency] },
      });
    }, delay);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-2xl pt-24 pb-16">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Create Your Video</h1>
          <p className="mt-2 text-muted-foreground">Describe your avatar animation and we'll bring it to life</p>
        </div>

        <div className="space-y-6 rounded-xl border border-border bg-card p-6">
          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Describe your video</Label>
            <Textarea
              id="prompt"
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A cheerful cat character wearing a top hat, waving at the camera in a colorful forest. Include 2 butterfly characters flying around."
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Include the number of characters, animals, scene description, and actions.
            </p>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Video Duration</Label>
            <div className="grid grid-cols-3 gap-3">
              {TIERS.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setDuration(tier)}
                  className={`rounded-lg border p-4 text-center transition-all ${
                    duration === tier
                      ? "border-primary bg-primary/10 glow-purple"
                      : "border-border bg-secondary hover:border-primary/40"
                  }`}
                >
                  <p className="font-display text-sm font-semibold">{DURATION_LABELS[tier]}</p>
                  <p className="mt-1 text-2xl font-bold text-primary">
                    {formatPrice(PRICING[tier][currency], currency)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Generate */}
          <Button
            className="w-full h-14 text-lg font-semibold glow-purple glow-pulse"
            disabled={!prompt.trim() || generating}
            onClick={handleGenerate}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating your video…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Video — {formatPrice(PRICING[duration][currency], currency)}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
