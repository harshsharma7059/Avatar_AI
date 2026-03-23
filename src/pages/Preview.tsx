import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { VideoPlayer } from "@/components/preview/VideoPlayer";
import { ScriptPreview } from "@/components/preview/ScriptPreview";
import { OrderSummary } from "@/components/preview/OrderSummary";
import { AlertTriangle, Zap } from "lucide-react";
import type { Currency, DurationTier } from "@/lib/pricing";

import demoVideo1 from "@/assets/demo-video-1.mp4.asset.json";
import demoVideo2 from "@/assets/demo-video-2.mp4.asset.json";
import demoVideo3 from "@/assets/demo-video-3.mp4.asset.json";
import demoVideo4 from "@/assets/demo-video-4.mp4.asset.json";
import demoVideo5 from "@/assets/demo-video-5.mp4.asset.json";
import demoVideo6 from "@/assets/demo-video-6.mp4.asset.json";
import demoVideo7 from "@/assets/demo-video-7.mp4.asset.json";
import demoVideo8 from "@/assets/demo-video-8.mp4.asset.json";
import demoVideo9 from "@/assets/demo-video-9.mp4.asset.json";
import demoVideo12 from "@/assets/demo-video-12.mp4.asset.json";
import demoVideo13 from "@/assets/demo-video-13.mp4.asset.json";
import demoVideo14 from "@/assets/demo-video-14.mp4.asset.json";
import demoVideo15 from "@/assets/demo-video-15.mp4.asset.json";
import demoVideo16 from "@/assets/demo-video-16.mp4.asset.json";
import demoVideo17 from "@/assets/demo-video-17.mp4.asset.json";
import demoVideo18 from "@/assets/demo-video-18.mp4.asset.json";
import demoVideo19 from "@/assets/demo-video-19.mp4.asset.json";
import demoVideo20 from "@/assets/demo-video-20.mp4.asset.json";
import demoVideo21 from "@/assets/demo-video-21.mp4.asset.json";

const DEMO_VIDEOS = [
  demoVideo1.url, demoVideo2.url, demoVideo3.url,
  demoVideo4.url, demoVideo5.url, demoVideo6.url,
  demoVideo7.url, demoVideo8.url, demoVideo9.url,
  demoVideo12.url, demoVideo13.url, demoVideo14.url,
  demoVideo15.url, demoVideo16.url, demoVideo17.url,
  demoVideo18.url, demoVideo19.url, demoVideo20.url,
  demoVideo21.url,
];

function pickDemoVideo(prompt: string): string {
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

  if (!state) {
    navigate("/studio");
    return null;
  }

  const { prompt, duration, currency, price, script } = state;
  const spokenText = script.replace(/\[.*?\]/g, "").replace(/\n{2,}/g, "\n").trim();
  const videoSrc = pickDemoVideo(prompt);

  const handlePayment = () => {
    window.speechSynthesis.cancel();
    navigate("/download", { state: { prompt, duration, currency, price, script } });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-3xl pt-24 pb-16 space-y-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold">Preview Your Video</h1>
          <p className="text-muted-foreground mt-1">Review the demo and script before ordering your custom 4K render</p>
        </div>

        <VideoPlayer videoSrc={videoSrc} spokenText={spokenText} />

        <ScriptPreview script={script} />

        {/* What you get after payment */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "🎬", label: "Custom 4K Video" },
            { icon: "🎙️", label: "AI Voice Narration" },
            { icon: "⚡", label: "Fast Delivery" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-border bg-secondary/50 p-3 text-center">
              <p className="text-xl mb-1">{item.icon}</p>
              <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Demo Warning */}
        <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <AlertTriangle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-sm">This is a demo preview</p>
            <p className="text-sm text-muted-foreground">
              After payment, your custom video will be rendered in 4K with AI voice narration matching your exact script.
            </p>
          </div>
        </div>

        <OrderSummary
          prompt={prompt}
          duration={duration}
          currency={currency}
          price={price}
          onPay={handlePayment}
        />
      </div>
    </div>
  );
}
