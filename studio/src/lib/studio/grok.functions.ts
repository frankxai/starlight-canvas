import { createServerFn } from "@tanstack/react-start";

interface GrokInput {
  title: string;
  role: string;
  body: string;
  upstream: string;
  house: string;
}

export const grokPass = createServerFn({ method: "POST" })
  .validator((input: GrokInput) => {
    const title = String(input?.title ?? "").slice(0, 180);
    const role = String(input?.role ?? "").slice(0, 80);
    const body = String(input?.body ?? "").slice(0, 1800);
    const upstream = String(input?.upstream ?? "").slice(0, 3500);
    const house = String(input?.house ?? "starlight").slice(0, 40);
    if (!body.trim()) throw new Error("Write the node's brief before asking Grok.");
    return { title, role, body, upstream, house };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Grok is not available in this room yet." };

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 420,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You are one node inside Starlight Canvas, the shared studio of Starlight (agent OS), Arcanea (worlds), and GenCreator (series). Write only that node's output. 140 to 200 words. Concrete nouns. No preamble, no pep talk, no mention that you are a model. Do not invent celebrity endorsements or claim a living person joined the studio. If the brief and upstream memory conflict, memory law wins. Lens nodes write a shot ticket, not a claim that video already exists.",
          },
          {
            role: "user",
            content: `House: ${data.house}\nNode: ${data.title}\nRole: ${data.role}\n\nThis node's instructions:\n${data.body}\n\nUpstream:\n${data.upstream || "None."}`,
          },
        ],
      }),
    });

    if (!res.ok) return { ok: false as const, error: `Grok declined the pass (${res.status}).` };
    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = body.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { ok: false as const, error: "Grok returned an empty pass." };
    return { ok: true as const, text };
  });
