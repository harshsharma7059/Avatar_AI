import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/pricing";
import { AlertTriangle, Play, Pause, Crown, Lock, Volume2, VolumeX } from "lucide-react";
import type { Currency, DurationTier } from "@/lib/pricing";

import demoVideo1 from "@/assets/demo-video-1.mp4.asset.json";
import demoVideo2 from "@/assets/demo-video-2.mp4.asset.json";
import demoVideo3 from "@/assets/demo-video-3.mp4.asset.json";

const DEMO_VIDEOS = [demoVideo1.url, demoVideo2.url, demoVideo3.url];

function pickDemoVideo(prompt: string): string {
  // Simple hash to deterministically pick a demo video based on prompt
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = (hash * 31 + prompt.charCodeAt(i)) | 0;
  }
  return DEMO_VIDEOS[Math.abs(hash) % DEMO_VIDEOS.length];
}

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const script = state?.script || "";
  const spokenText = script.replace(/\[.*?\]/g, "").replace(/\n{2,}/g, "\n").trim();
  const videoSrc = state ? pickDemoVideo(state.prompt) : "";

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      videoRef.current?.pause();
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      videoRef.current?.play();
      // Start voice narration in sync
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = isMuted ? 0 : 1;
      utterance.onend = () => {};
      utterance.onerror = () => {};
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  }, [isPlaying, spokenText, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (utteranceRef.current) {
        // Can't change volume mid-utterance easily, so cancel and restart if needed
      }
      if (videoRef.current) {
        videoRef.current.muted = next;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnded = () => {
      setIsPlaying(false);
      window.speechSynthesis.cancel();
    };
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("ended", onEnded);
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
    videoRef.current?.pause();
    navigate("/download", { state: { prompt, duration, currency, price, script } });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-3xl pt-24 pb-16">
        <h1 className="font-display text-3xl font-bold text-center mb-8">Preview Your Video</h1>

        {/* Video Player */}
        <div className="relative aspect-video rounded-xl border border-border bg-black overflow-hidden mb-6">
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full object-cover"
            playsInline
            muted={isMuted}
            loop
          />

          {/* Play/Pause overlay */}
          {!isPlaying && (
            <button
              onClick={handlePlayPause}
              className="absolute inset-0 flex items-center justify-center z-10 bg-black/30 hover:bg-black/40 transition-colors"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/80 backdrop-blur-sm">
                <Play className="h-8 w-8 text-primary-foreground ml-1" />
              </div>
            </button>
          )}

          {isPlaying && (
            <button
              onClick={handlePlayPause}
              className="absolute inset-0 z-10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center bg-black/20"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/80 backdrop-blur-sm">
                <Pause className="h-8 w-8 text-primary-foreground" />
              </div>
            </button>
          )}

          <Badge className="absolute top-3 left-3 z-20 bg-destructive/80 text-destructive-foreground">
            DEMO PREVIEW
          </Badge>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <p className="font-display text-6xl font-bold rotate-[-30deg] text-white">
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
            <p className="font-semibold text-sm">This is a demo preview</p>
            <p className="text-sm text-muted-foreground">
              The demo uses sample animations. After payment, your custom full-length video will be rendered in stunning 4K with professional AI voice matching your exact script.
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