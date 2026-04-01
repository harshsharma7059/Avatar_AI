import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const HEYGEN_BASE = "https://api.heygen.com";

interface VideoRequest {
  prompt: string;
  script: string;
  duration: string;
  orderId: string;
  avatarId?: string;
  voiceId?: string;
}

interface StatusRequest {
  action: "status";
  videoId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const HEYGEN_API_KEY = Deno.env.get("HEYGEN_API_KEY");

  if (!HEYGEN_API_KEY) {
    return new Response(
      JSON.stringify({ error: "HEYGEN_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();

    // ─── STATUS POLLING ───
    if (body.action === "status" && body.videoId) {
      const statusRes = await fetch(
        `${HEYGEN_BASE}/v1/video_status.get?video_id=${encodeURIComponent(body.videoId)}`,
        { headers: { "X-Api-Key": HEYGEN_API_KEY, Accept: "application/json" } }
      );
      const statusData = await statusRes.json();

      if (!statusRes.ok) {
        return new Response(
          JSON.stringify({ error: statusData.error?.message || "Failed to check status" }),
          { status: statusRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const d = statusData.data;
      return new Response(
        JSON.stringify({
          status: d.status, // pending | waiting | processing | completed | failed
          videoUrl: d.video_url || null,
          thumbnailUrl: d.thumbnail_url || null,
          duration: d.duration || null,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── VIDEO GENERATION ───
    const { prompt, script, duration, orderId, avatarId, voiceId } =
      body as VideoRequest;

    if (!prompt || !script || !orderId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: prompt, script, orderId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use Lovable AI to enhance the script for avatar narration
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let enhancedScript = script;

    if (LOVABLE_API_KEY) {
      try {
        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              {
                role: "system",
                content:
                  "You are a script editor. Clean up the following narration script for a talking-head AI avatar video. Remove any scene directions in [brackets]. Make it sound natural and conversational. Keep the same length. Output ONLY the cleaned script text, nothing else.",
              },
              { role: "user", content: script.slice(0, 4500) },
            ],
          }),
        });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          enhancedScript = aiData.choices?.[0]?.message?.content || script;
        }
      } catch (e) {
        console.error("AI script enhancement failed (non-critical):", e);
      }
    }

    // Build HeyGen v2 video generation payload
    const videoPayload: Record<string, unknown> = {
      video_inputs: [
        {
          character: {
            type: "avatar",
            avatar_id: avatarId || "Daisy-inskirt-20220818", // default public avatar
            avatar_style: "normal",
          },
          voice: {
            type: "text",
            voice_id: voiceId || "2d5b0e6cf36f460aa7fc47e3eee4ba54", // default English voice
            input_text: enhancedScript.slice(0, 4500),
            speed: 1.0,
          },
          background: {
            type: "color",
            value: "#1a1a2e",
          },
        },
      ],
      dimension: { width: 1920, height: 1080 },
      test: false,
    };

    console.log("Sending to HeyGen:", JSON.stringify({ orderId, scriptLen: enhancedScript.length }));

    const heygenRes = await fetch(`${HEYGEN_BASE}/v2/video/generate`, {
      method: "POST",
      headers: {
        "X-Api-Key": HEYGEN_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(videoPayload),
    });

    const heygenData = await heygenRes.json();

    if (!heygenRes.ok || heygenData.error) {
      console.error("HeyGen error:", JSON.stringify(heygenData));
      return new Response(
        JSON.stringify({
          error: heygenData.error?.message || "HeyGen video generation failed",
          details: heygenData.error,
        }),
        { status: heygenRes.status || 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const videoId = heygenData.data?.video_id;

    return new Response(
      JSON.stringify({
        status: "processing",
        videoId,
        message: "Video generation started with HeyGen AI avatar.",
        estimatedTime:
          duration === "1-5" ? "2–5 minutes" : duration === "5-15" ? "5–15 minutes" : "15–30 minutes",
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
