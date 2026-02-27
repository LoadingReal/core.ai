import { Hono } from "hono";
import { handle } from "hono/vercel";

export const runtime = "edge";

const app = new Hono().basePath("/api");

app.post("/chat", async (c) => {
  try {
    const { messages } = await c.req.json();

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemma-3n-e4b-it:free",
          messages: messages,
        }),
      },
    );

    const data = await response.json();

    if (!data.choices) {
      return c.json({ error: "No response from AI provider" }, 500);
    }

    return c.json(data.choices[0].message);
  } catch (err) {
    return c.json({ error: "Backend failure" }, 500);
  }
});

export const GET = handle(app);
export const POST = handle(app);
