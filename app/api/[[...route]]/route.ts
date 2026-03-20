import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { env } from "hono/adapter";
import { stream, streamText } from "hono/streaming";

export const runtime = "edge";

const app = new Hono().basePath("/api");

app.post("/chat", async (c) => {
  try {
    const { VPS_URL } = env<{ VPS_URL: string }>(c);
    const { messages } = await c.req.json();
    const recentMessages = messages.slice(-10);
    const controller = new AbortController();

    const response = await fetch(`${VPS_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemma3:270m",
        messages: recentMessages,
        stream: true,
      }),
      signal: controller.signal,
    });

    if (!response.ok) return c.json({ error: "VPS Offline" }, 500);

    return streamText(c, async (stream) => {
      stream.onAbort(() => {
        console.log("User disconnected. Stopping AI...");
        controller.abort();
      });

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              await stream.write(json.message.content);
            }
          } catch (e) {
            // Skip partial JSON lines
          }
        }
      }
    });
  } catch (err) {
    return c.json({ error: "Backend failure" }, 500);
  }
});

export const GET = handle(app);
export const POST = handle(app);
export const onRequest = handle(app);
