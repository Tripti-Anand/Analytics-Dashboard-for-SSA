export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return new Response("Missing OPENAI_API_KEY", { status: 500 });
    }

    // ✅ use JSON instead of formData
    const body = await req.json();
    const message = body.message;

    if (!message) {
      return new Response("Message required", { status: 400 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a solar physics assistant." },
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI error:", err);
      return new Response("OpenAI failed", { status: 502 });
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        reply: data.choices?.[0]?.message?.content || "No response",
      }),
      { status: 200 }
    );

  } catch (err) {
    console.error("CHAT ERROR:", err);
    return new Response("Internal error", { status: 500 });
  }
}
