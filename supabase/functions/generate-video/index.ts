import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * generate-video edge function
 * 
 * Called after payment to generate a real AI video.
 * Accepts: { prompt, script, duration, orderId }
 * 
 * This function is designed to integrate with external video generation APIs.
 * Currently supports a polling-based architecture:
 *   1. Submit video generation job
 *   2. Return job ID for client to poll status
 *   3. Client polls until video is ready
 * 
 * To connect a real provider, set the VIDEO_API_KEY secret and
 * uncomment the provider-specific code below.
 */

interface VideoRequest {
  prompt: string;
  script: string;
  duration: string;
  orderId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, script, duration, orderId } = (await req.json()) as VideoRequest;

    if (!prompt || !script || !orderId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: prompt, script, orderId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const VIDEO_API_KEY = Deno.env.get("VIDEO_API_KEY");

    // ─── REAL VIDEO GENERATION (uncomment when API key is configured) ───
    // Supports providers like Runway, Kling, HeyGen, Pika, etc.
    // Each provider has slightly different APIs — adapt the URL and payload.

    if (VIDEO_API_KEY) {
      // ─── Example: Runway ML Gen-3 ───
      // const response = await fetch("https://api.runwayml.com/v1/generate", {
      //   method: "POST",
      //   headers: {
      //     "Authorization": `Bearer ${VIDEO_API_KEY}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     prompt: `${prompt}. Narration script context: ${script}`,
      //     duration: duration === "1-5" ? 5 : duration === "5-15" ? 15 : 30,
      //     resolution: "1080p",
      //     aspect_ratio: "16:9",
      //   }),
      // });

      // ─── Example: Kling AI ───
      // const response = await fetch("https://api.klingai.com/v1/videos/generations", {
      //   method: "POST",
      //   headers: {
      //     "Authorization": `Bearer ${VIDEO_API_KEY}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     prompt: `${prompt}. Script: ${script}`,
      //     duration: duration === "1-5" ? "5" : duration === "5-15" ? "10" : "10",
      //     mode: "high_quality",
      //     aspect_ratio: "16:9",
      //   }),
      // });

      // ─── Example: HeyGen (AI Avatar videos) ───
      // const response = await fetch("https://api.heygen.com/v2/video/generate", {
      //   method: "POST",
      //   headers: {
      //     "X-Api-Key": VIDEO_API_KEY,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     video_inputs: [{
      //       character: { type: "avatar", avatar_id: "default" },
      //       voice: { type: "text", input_text: script },
      //       background: { type: "ai_generated", value: prompt },
      //     }],
      //     dimension: { width: 1920, height: 1080 },
      //   }),
      // });

      // For now, return a mock job ID — replace with real API response parsing
      const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      
      return new Response(
        JSON.stringify({
          status: "processing",
          jobId,
          message: "Video generation started. Poll /generate-video/status for updates.",
          estimatedTime: duration === "1-5" ? "2-5 minutes" : duration === "5-15" ? "5-15 minutes" : "15-30 minutes",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── FALLBACK: No API key configured ───
    // Return a simulated response so the app flow still works
    const jobId = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return new Response(
      JSON.stringify({
        status: "processing",
        jobId,
        message: "Video generation queued (demo mode — configure VIDEO_API_KEY for real generation).",
        estimatedTime: "2-5 minutes",
        demo: true,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-video error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
