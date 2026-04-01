import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Download as DownloadIcon,
  ArrowRight,
  Loader2,
  Video,
  AlertCircle,
  Play,
} from "lucide-react";

interface DownloadState {
  prompt?: string;
  duration?: string;
  currency?: string;
  price?: number;
  script?: string;
}

const RENDER_STEPS = [
  "Initializing HeyGen AI avatar…",
  "Processing narration script…",
  "Generating avatar animation…",
  "Rendering HD video frames…",
  "Compositing final output…",
  "Encoding & optimizing…",
];

export default function DownloadPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as DownloadState | null;

  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState(RENDER_STEPS[0]);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"starting" | "processing" | "completed" | "failed">("starting");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(0);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  // Kick off generation
  useEffect(() => {
    if (!state?.prompt) return;

    const start = async () => {
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/generate-video`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify({
            prompt: state.prompt,
            script: state.script || "",
            duration: state.duration || "1-5",
            orderId: `order_${Date.now()}`,
          }),
        });
        const data = await res.json();

        if (!res.ok || data.error) {
          setError(data.error || "Failed to start video generation");
          setStatus("failed");
          return;
        }

        if (data.videoId) {
          setVideoId(data.videoId);
          setStatus("processing");
        }
      } catch (err) {
        console.error("Video generation request failed:", err);
        setError("Network error — please try again.");
        setStatus("failed");
      }
    };
    start();
  }, [state, supabaseUrl, anonKey]);

  // Poll for status
  const pollStatus = useCallback(async () => {
    if (!videoId) return;
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/generate-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ action: "status", videoId }),
      });
      const data = await res.json();

      if (data.status === "completed") {
        setVideoUrl(data.videoUrl);
        setThumbnailUrl(data.thumbnailUrl);
        setStatus("completed");
        setProgress(100);
        setStepText("Your video is ready!");
        if (pollRef.current) clearInterval(pollRef.current);
      } else if (data.status === "failed") {
        setError("Video rendering failed. Please try again.");
        setStatus("failed");
        if (pollRef.current) clearInterval(pollRef.current);
      }
    } catch {
      // transient network error, keep polling
    }
  }, [videoId, supabaseUrl, anonKey]);

  useEffect(() => {
    if (!videoId || status === "completed" || status === "failed") return;
    pollRef.current = setInterval(pollStatus, 8000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [videoId, status, pollStatus]);

  // Progress animation
  useEffect(() => {
    if (status !== "processing" && status !== "starting") return;
    const iv = setInterval(() => {
      stepRef.current = Math.min(stepRef.current + 1, RENDER_STEPS.length - 1);
      setStepText(RENDER_STEPS[stepRef.current]);
      setProgress((p) => Math.min(p + 4 + Math.random() * 6, 92));
    }, 5000);
    return () => clearInterval(iv);
  }, [status]);

  if (!state?.prompt) {
    navigate("/studio");
    return null;
  }

  const handleDownload = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.target = "_blank";
    a.download = "heygen-video.mp4";
    a.click();
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container max-w-lg pt-24 pb-16 text-center">
        {status === "failed" ? (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">Generation Failed</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate("/studio")}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </>
        ) : status === "completed" ? (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">Your Video is Ready!</h1>
            <p className="text-muted-foreground mb-8">
              AI avatar video generated by HeyGen in Full HD
            </p>

            <div className="rounded-xl border border-border bg-card p-6 space-y-4 mb-8">
              {videoUrl ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary">
                  <video
                    src={videoUrl}
                    poster={thumbnailUrl || undefined}
                    controls
                    className="w-full h-full object-contain"
                  />
                  <Badge className="absolute top-3 left-3 z-10 bg-success text-success-foreground">
                    HD READY
                  </Badge>
                </div>
              ) : (
                <div className="relative aspect-video rounded-lg bg-secondary flex items-center justify-center">
                  <Play className="h-12 w-12 text-muted-foreground" />
                </div>
              )}

              <Button className="w-full h-12 text-lg font-semibold" onClick={handleDownload}>
                <DownloadIcon className="mr-2 h-5 w-5" />
                Download Video
              </Button>
            </div>

            <Button variant="outline" onClick={() => navigate("/studio")}>
              Create another video
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Video className="h-10 w-10 text-primary animate-pulse" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">Rendering Your Video</h1>
            <p className="text-muted-foreground mb-8">
              HeyGen AI is generating your avatar video with professional narration
            </p>

            <div className="rounded-xl border border-border bg-card p-6 space-y-4 mb-6">
              <div className="flex items-center gap-2 justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <p className="text-sm font-medium text-primary">{stepText}</p>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {videoId ? `Video ID: ${videoId.slice(0, 16)}…` : "Connecting to HeyGen…"}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-secondary/50 p-4">
              <p className="text-xs text-muted-foreground">
                ⏱ Estimated:{" "}
                {state.duration === "15+"
                  ? "15–30 minutes"
                  : state.duration === "5-15"
                    ? "5–15 minutes"
                    : "2–5 minutes"}
                <br />
                We're polling HeyGen every 8 seconds — you can stay on this page.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
