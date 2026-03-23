import { useRef, useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";

interface VideoPlayerProps {
  videoSrc: string;
  spokenText: string;
  posterUrl?: string;
}

export function VideoPlayer({ videoSrc, spokenText, posterUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      videoRef.current?.pause();
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      videoRef.current?.play();
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = isMuted ? 0 : 1;
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  }, [isPlaying, spokenText, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  }, []);

  const toggleFullscreen = useCallback(() => {
    videoRef.current?.requestFullscreen?.();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (video.duration) setProgress((video.currentTime / video.duration) * 100);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      window.speechSynthesis.cancel();
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="relative aspect-video rounded-xl border border-border bg-black overflow-hidden group">
      <video
        ref={videoRef}
        src={videoSrc}
        poster={posterUrl}
        className="w-full h-full object-cover"
        playsInline
        muted={isMuted}
        loop
      />

      {/* Play/Pause overlay */}
      {!isPlaying && (
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center z-10 bg-black/40 hover:bg-black/50 transition-colors"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 backdrop-blur-sm shadow-lg shadow-primary/30 transition-transform hover:scale-110">
            <Play className="h-7 w-7 text-primary-foreground ml-1" />
          </div>
        </button>
      )}

      {isPlaying && (
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/20"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/80 backdrop-blur-sm">
            <Pause className="h-7 w-7 text-primary-foreground" />
          </div>
        </button>
      )}

      {/* Top badges */}
      <Badge className="absolute top-3 left-3 z-20 bg-destructive/90 text-destructive-foreground text-xs font-semibold tracking-wide">
        DEMO PREVIEW
      </Badge>

      {/* Controls bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress bar */}
        <div className="w-full h-1 bg-white/20 rounded-full mb-2 cursor-pointer">
          <div
            className="h-full bg-primary rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
              className="p-1 text-white/80 hover:text-white transition-colors"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              className="p-1 text-white/80 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            className="p-1 text-white/80 hover:text-white transition-colors"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none">
        <p className="font-display text-6xl font-bold rotate-[-30deg] text-white select-none">
          AVATAR AI
        </p>
      </div>
    </div>
  );
}
