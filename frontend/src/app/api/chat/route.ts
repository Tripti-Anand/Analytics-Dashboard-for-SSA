export const runtime = "nodejs";

export async function POST() {
  return new Response(
    JSON.stringify({ message: "API is working" }),
    { status: 200 }
  );
}
