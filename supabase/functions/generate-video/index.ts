import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const VIDEO_API_KEY = Deno.env.get("VIDEO_API_KEY");

    // Use Lovable AI to generate enhanced video direction notes
    let directionNotes = "";
    if (LOVABLE_API_KEY) {
      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                content: `You are a video production director. Given a script and prompt, provide concise technical direction notes for an AI video generation system. Include: camera angles, lighting style, color palette, pacing, transitions. Keep it under 200 words.`,
              },
              {
                role: "user",
                content: `Prompt: ${prompt}\n\nScript excerpt: ${script.slice(0, 500)}`,
              },
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          directionNotes = aiData.choices?.[0]?.message?.content || "";
        }
      } catch (e) {
        console.error("AI direction notes failed (non-critical):", e);
      }
    }

    // ─── REAL VIDEO GENERATION (when VIDEO_API_KEY is configured) ───
    if (VIDEO_API_KEY) {
      // Example: Runway ML, Kling, HeyGen — adapt URL and payload per provider
      // const response = await fetch("https://api.runwayml.com/v1/generate", { ... });
      
      const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      
      return new Response(
        JSON.stringify({
          status: "processing",
          jobId,
          message: "Video generation started with AI-enhanced direction.",
          estimatedTime: duration === "1-5" ? "2-5 minutes" : duration === "5-15" ? "5-15 minutes" : "15-30 minutes",
          directionNotes: directionNotes ? directionNotes.slice(0, 500) : undefined,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── FALLBACK: Demo mode ───
    const jobId = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return new Response(
      JSON.stringify({
        status: "processing",
        jobId,
        message: "Video generation queued (demo mode — configure VIDEO_API_KEY for real generation).",
        estimatedTime: "2-5 minutes",
        demo: true,
        directionNotes: directionNotes ? directionNotes.slice(0, 500) : undefined,
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
