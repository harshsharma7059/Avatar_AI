import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/pricing";
import { AlertTriangle, Play, Pause, Crown, Lock, Volume2, VolumeX } from "lucide-react";
import type { Currency, DurationTier } from "@/lib/pricing";

interface PreviewState {
  prompt: string;
  duration: DurationTier;
  currency: Currency;
  price: number;
  script: string;
}

export default function Preview() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PreviewState | null;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const script = state?.script || "";
  const spokenText = script.replace(/\[.*?\]/g, "").replace(/\n{2,}/g, "\n").trim();

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = isMuted ? 0 : 1;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  }, [isPlaying, spokenText, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  if (!state) {
    navigate("/studio");
    return null;
  }

  const { prompt, duration, currency, price } = state;

  const handlePayment = () => {
    window.speechSynthesis.cancel();
    navigate("/download", { state: { prompt, duration, currency, price, script } });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-3xl pt-24 pb-16">
        <h1 className="font-display text-3xl font-bold text-center mb-8">Preview Your Video</h1>

        {/* Video Player Mock */}
        <div className="relative aspect-video rounded-xl border border-border bg-secondary overflow-hidden mb-6">
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center z-10 hover:bg-black/10 transition-colors"
          >
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm">
                {isPlaying ? (
                  <Pause className="h-8 w-8 text-primary" />
                ) : (
                  <Play className="h-8 w-8 text-primary ml-1" />
                )}
              </div>
              <p className="text-lg font-display font-semibold text-foreground/80">
                {isPlaying ? "Playing Demo" : "Play Demo Preview"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">420p • 2 min preview with voice</p>
            </div>
          </button>

          <Badge className="absolute top-3 left-3 z-20 bg-destructive/80 text-destructive-foreground">
            420p DEMO
          </Badge>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/40 text-foreground hover:bg-black/60 transition-colors"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <p className="font-display text-6xl font-bold rotate-[-30deg] text-foreground">
              AVATAR AI
            </p>
          </div>
        </div>

        {/* Script preview */}
        <div className="rounded-xl border border-border bg-card p-5 mb-6">
          <h2 className="font-display text-lg font-semibold mb-3">📝 Generated Script</h2>
          <div className="max-h-48 overflow-y-auto pr-2">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {script}
            </p>
          </div>
        </div>

        {/* Demo Warning */}
        <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 mb-6">
          <AlertTriangle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">This is a demo video</p>
            <p className="text-sm text-muted-foreground">
              After payment, the full-length video will be available in stunning 4K quality with professional AI voice.
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
            <div className="flex justify-between">
              <span className="text-muted-foreground">Voice</span>
              <span>AI Professional Narration</span>
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
