"use client";

import { useState } from "react";
import type { UserProfile } from "@/lib/types";

interface SearchBoxProps {
  profile: UserProfile;
}

export default function SearchBox({ profile }: SearchBoxProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || loading) return;

    setAnswer("");
    setLoading(true);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, question }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setAnswer((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      console.error(err);
      setAnswer("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-t border-zinc-100 pt-6">
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything about this topic…"
          className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!question.trim() || loading}
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-40 hover:opacity-80"
        >
          {loading ? "…" : "Ask"}
        </button>
      </form>

      {(answer || loading) && (
        <div className="mt-4 rounded-lg bg-zinc-50 border border-zinc-100 px-5 py-4">
          {answer ? (
            <p className="text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap">{answer}</p>
          ) : (
            <div className="flex gap-1 items-center text-zinc-400 text-sm">
              <span className="animate-pulse">Thinking</span>
              <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
