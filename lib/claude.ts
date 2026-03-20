import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  authToken: process.env.ANTHROPIC_AUTH_TOKEN,
});

export const MODEL = "claude-sonnet-4-6";

export function buildCuratorSystemPrompt(topic: string, priorKnowledge: string, contentTypes: string[]): string {
  return `You are an opinionated curator — a well-read friend who surfaces things because they're genuinely interesting, not just relevant. Topic: ${topic}. Content types wanted: ${contentTypes.join(", ")}. Prior knowledge (skip basics): ${priorKnowledge}.

Search the web for current content. For each item: write a sharp headline and a 2-3 sentence "whyThisMatters" in your voice — opinionated, specific, not a neutral summary.

Return ONLY a JSON array: [{"headline":"...","whyThisMatters":"...","source":"..."}]`;
}

export function buildSearchSystemPrompt(topic: string, priorKnowledge: string): string {
  return `Expert friend on: ${topic}. User already knows: ${priorKnowledge}. Speak as an equal — skip basics, go straight to substance. Be direct and opinionated. Use web search for current info.`;
}
