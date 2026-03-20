import { NextRequest } from "next/server";
import { anthropic, MODEL, buildSearchSystemPrompt } from "@/lib/claude";
import type { SearchRequest } from "@/lib/types";
import type Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const body: SearchRequest = await req.json();
  const { profile, question } = body;

  const systemPrompt = buildSearchSystemPrompt(profile.topic, profile.priorKnowledge);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        type MessageParam = Parameters<typeof anthropic.messages.create>[0]["messages"][number];
        const messages: MessageParam[] = [{ role: "user", content: question }];

        const maxIterations = 8;

        for (let i = 0; i < maxIterations; i++) {
          const response = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 2048,
            system: systemPrompt,
            tools: [{ type: "web_search_20260209" as const, name: "web_search" }],
            messages,
          });

          for (const block of response.content) {
            if (block.type === "text" && block.text) {
              controller.enqueue(encoder.encode(block.text));
            }
          }

          if (response.stop_reason === "end_turn") break;

          if (response.stop_reason === "pause_turn") {
            messages.push({ role: "assistant", content: response.content as Anthropic.ContentBlockParam[] });
            continue;
          }

          break;
        }
      } catch (err) {
        console.error("Search error:", err);
        const message = err instanceof Error ? err.message : "Something went wrong.";
        controller.enqueue(encoder.encode(`Error: ${message}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
