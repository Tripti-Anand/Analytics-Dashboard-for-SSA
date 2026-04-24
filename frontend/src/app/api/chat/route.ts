export async function POST() {
  const res = await fetch("https://api.groq.com/openai/v1/models", {
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
  });

  const data = await res.text();

  return new Response(data);
}
