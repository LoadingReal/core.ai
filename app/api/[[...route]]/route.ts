import { Hono } from "hono";
import { handle } from "hono/vercel";
import { stream, streamText } from "hono/streaming";

export const runtime = "edge";

type Bindings = {
  VPS_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>().basePath("/api");

app.post("/chat", async (c) => {
  try {
    const vpsUrl = c.env?.VPS_URL || process.env.VPS_URL;

    if (!vpsUrl) {
      return c.json({ error: "VPS_URL Environment Variable is missing" }, 500);
    }

    console.log(`Fetching from: ${vpsUrl}/api/chat`);
    const { messages } = await c.req.json();
    const recentMessages = messages.slice(-10);
    const controller = new AbortController();

    const response = await fetch(`${vpsUrl}/api/chat`, {
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

    c.header("Content-Type", "text/event-stream");
    c.header("Cache-Control", "no-cache");
    c.header("Connection", "keep-alive");
    c.header("X-Content-Type-Options", "nosniff");

    return streamText(c, async (stream) => {
      stream.onAbort(() => {
        controller.abort();
      });

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              await stream.write(json.message.content);
            }
            if (json.done) return;
          } catch (e) {
            console.error("Split JSON detected, skipping or waiting...");
          }
        }
      }
    });
  } catch (err: any) {
    return c.json(
      {
        error: "Backend failure",
        message: err.message,
        stack: err.stack,
      },
      500,
    );
  }
});

export const GET = handle(app);
export const POST = handle(app);
