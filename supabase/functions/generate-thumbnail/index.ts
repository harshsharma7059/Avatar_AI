import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * generate-thumbnail edge function
 * 
 * Uses Lovable AI (Gemini image generation) to create a poster/thumbnail
 * image based on the user's video prompt.
 */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required field: prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use Gemini image generation model
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [
          {
            role: "user",
            content: `Generate a cinematic 16:9 thumbnail image for an AI-generated video with this concept: "${prompt}". 
Make it visually stunning, with dramatic lighting, vibrant colors, and a professional film-quality look. 
The style should be modern 3D animation or high-quality CGI.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway returned ${response.status}`);
    }

    const data = await response.json();
    
    // Extract image from response - Gemini image models return base64 in content parts
    const content = data.choices?.[0]?.message?.content;
    const parts = data.choices?.[0]?.message?.parts;
    
    // Try to find image data in various response formats
    let imageData = null;
    
    if (parts && Array.isArray(parts)) {
      const imagePart = parts.find((p: any) => p.inline_data?.mime_type?.startsWith("image/"));
      if (imagePart) {
        imageData = {
          base64: imagePart.inline_data.data,
          mimeType: imagePart.inline_data.mime_type,
        };
      }
    }

    if (imageData) {
      return new Response(
        JSON.stringify({ 
          thumbnailUrl: `data:${imageData.mimeType};base64,${imageData.base64}`,
          generated: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback: no image generated, return null
    return new Response(
      JSON.stringify({ thumbnailUrl: null, generated: false, message: "Image generation returned text only" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-thumbnail error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
