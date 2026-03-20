import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Download as DownloadIcon, ArrowRight, Loader2, Video } from "lucide-react";

interface DownloadState {
  prompt?: string;
  duration?: string;
  currency?: string;
  price?: number;
  script?: string;
}

const RENDER_STEPS = [
  "Initializing AI video engine…",
  "Generating character models…",
  "Rendering animation frames…",
  "Applying voice narration…",
  "Compositing final 4K output…",
  "Encoding & optimizing…",
];

export default function DownloadPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as DownloadState | null;
  const [rendering, setRendering] = useState(true);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState(RENDER_STEPS[0]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (!state?.prompt) return;

    // Start the video generation job
    const startGeneration = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-video`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              prompt: state.prompt,
              script: state.script || "",
              duration: state.duration || "1-5",
              orderId: `order_${Date.now()}`,
            }),
          }
        );
        const data = await response.json();
        if (data.jobId) setJobId(data.jobId);
      } catch (err) {
        console.error("Video generation request failed:", err);
      }
    };
    startGeneration();

    // Simulate rendering progress
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < RENDER_STEPS.length) {
        setStepText(RENDER_STEPS[step]);
      }
      setProgress((prev) => {
        const next = Math.min(prev + 12 + Math.random() * 8, 95);
        if (next >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setProgress(100);
            setStepText("Your video is ready!");
            setRendering(false);
            setVideoReady(true);
          }, 1500);
        }
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [state]);

  if (!state?.prompt) {
    navigate("/studio");
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-lg pt-24 pb-16 text-center">
        {rendering ? (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Video className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">Rendering Your Video</h1>
            <p className="text-muted-foreground mb-8">
              Our AI is crafting your custom 4K video with professional narration
            </p>

            <div className="rounded-xl border border-border bg-card p-6 space-y-4 mb-6">
              <div className="flex items-center gap-2 justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <p className="text-sm font-medium text-primary">{stepText}</p>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {jobId ? `Job ID: ${jobId.slice(0, 16)}…` : "Connecting to render farm…"}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-secondary/50 p-4">
              <p className="text-xs text-muted-foreground">
                ⏱ Estimated time: {state.duration === "15+" ? "15–30 minutes" : state.duration === "5-15" ? "5–15 minutes" : "2–5 minutes"}
                <br />
                You can leave this page — we'll email you when it's ready.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">Your Video is Ready!</h1>
            <p className="text-muted-foreground mb-8">4K Ultra HD with AI professional narration</p>

            <div className="rounded-xl border border-border bg-card p-6 space-y-4 mb-8">
              <div className="relative aspect-video rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                <Badge className="absolute top-3 left-3 z-10 bg-green-500 text-white">
                  4K READY
                </Badge>
                <div className="text-center">
                  <Video className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">Full quality video rendered</p>
                </div>
              </div>

              <Button
                className="w-full h-12 text-lg font-semibold"
                onClick={() => {
                  alert("Download started! (Connect a real video API + storage to serve actual files)");
                }}
              >
                <DownloadIcon className="mr-2 h-5 w-5" />
                Download 4K Video
              </Button>
            </div>

            <Button variant="outline" onClick={() => navigate("/studio")}>
              Create another video
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
