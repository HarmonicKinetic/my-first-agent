export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL, buildCuratorSystemPrompt } from "@/lib/claude";
import type { CurateRequest, FeedItem } from "@/lib/types";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body: CurateRequest = await req.json();
  const { profile } = body;

  const systemPrompt = buildCuratorSystemPrompt(
    profile.topic,
    profile.priorKnowledge,
    profile.contentTypes
  );

  const userMessage = `You are curating content on: ${profile.topic}

Based on your knowledge, find ${profile.volume} genuinely interesting, non-obvious pieces of content, ideas, or developments related to: ${profile.topic}

Focus on: ${profile.contentTypes.join(", ")}. The person already knows: ${profile.priorKnowledge} — skip basics.

Return ONLY a JSON array (no other text):
[{"headline":"...","whyThisMatters":"...","source":"..."}]`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find(b => b.type === "text");
    const finalText = textBlock?.type === "text" ? textBlock.text : "";

    console.log("stop_reason:", response.stop_reason);
    console.log("text preview:", finalText.slice(0, 300));

    const jsonMatch = finalText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("No JSON. Raw:", finalText.slice(0, 400));
      return NextResponse.json(
        { error: "Bad response format: " + finalText.slice(0, 100) },
        { status: 500 }
      );
    }

    const rawItems = JSON.parse(jsonMatch[0]) as Array<{
      headline: string;
      whyThisMatters: string;
      source?: string;
    }>;

    const items: FeedItem[] = rawItems.map((item, idx) => ({
      id: `${Date.now()}-${idx}`,
      headline: item.headline,
      whyThisMatters: item.whyThisMatters,
      source: item.source,
    }));

    console.log(`Returning ${items.length} items`);
    return NextResponse.json({ items });
  } catch (err: unknown) {
    console.error("Curate error:", err);
    const status = (err as { status?: number })?.status;
    if (status === 429) {
      return NextResponse.json(
        { error: "Rate limit hit — wait 60 seconds and try again." },
        { status: 429 }
      );
    }
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
