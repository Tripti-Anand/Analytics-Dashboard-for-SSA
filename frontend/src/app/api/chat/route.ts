import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let formData: FormData;

  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch("http://127.0.0.1:8000/ai/chat", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: `Backend error: ${detail}` },
        { status: res.status }
      );
    }

    // ✅ Forward everything — response + surya_data + source
    const data = await res.json();
    return NextResponse.json(data);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}