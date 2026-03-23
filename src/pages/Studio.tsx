import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PRICING, DURATION_LABELS, formatPrice, type DurationTier } from "@/lib/pricing";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TIERS: DurationTier[] = ["1-5", "5-15", "15+"];

const PROGRESS_STEPS = [
  "Analyzing your prompt…",
  "Writing the script…",
  "Generating narration voice…",
  "Building animation scenes…",
  "Compositing final video…",
];

export default function Studio() {
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState<DurationTier>("1-5");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setProgress(0);
    setProgressStep(PROGRESS_STEPS[0]);

    // Animate progress bar
    let step = 0;
    const progressInterval = setInterval(() => {
      step++;
      if (step < PROGRESS_STEPS.length) {
        setProgressStep(PROGRESS_STEPS[step]);
      }
      setProgress((prev) => Math.min(prev + 15 + Math.random() * 10, 90));
    }, 2000);

    try {
      // Call AI to generate script
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-script`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ prompt, duration }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate script");
      }

      const { script } = await response.json();

      // Start thumbnail generation in background (non-blocking)
      let thumbnailUrl: string | null = null;
      try {
        const thumbRes = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-thumbnail`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ prompt }),
          }
        );
        if (thumbRes.ok) {
          const thumbData = await thumbRes.json();
          thumbnailUrl = thumbData.thumbnailUrl || null;
        }
      } catch {
        // Thumbnail is optional, continue without it
      }

      clearInterval(progressInterval);
      setProgress(100);
      setProgressStep("Done! Redirecting to preview…");

      await new Promise((r) => setTimeout(r, 800));

      navigate("/preview", {
        state: {
          prompt,
          duration,
          currency,
          price: PRICING[duration][currency],
          script,
          thumbnailUrl,
        },
      });
    } catch (err: any) {
      clearInterval(progressInterval);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setGenerating(false);
      setProgress(0);
      setProgressStep("");
    }
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
              disabled={generating}
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
                  disabled={generating}
                  className={`rounded-lg border p-4 text-center transition-all ${
                    duration === tier
                      ? "border-primary bg-primary/10 glow-purple"
                      : "border-border bg-secondary hover:border-primary/40"
                  } disabled:opacity-50`}
                >
                  <p className="font-display text-sm font-semibold">{DURATION_LABELS[tier]}</p>
                  <p className="mt-1 text-2xl font-bold text-primary">
                    {formatPrice(PRICING[tier][currency], currency)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          {generating && (
            <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <p className="text-sm font-medium text-primary">{progressStep}</p>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                AI is crafting your script & voice narration…
              </p>
            </div>
          )}

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
