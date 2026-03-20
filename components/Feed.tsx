"use client";

import { useState, useEffect } from "react";
import type { UserProfile, FeedItem as FeedItemType } from "@/lib/types";
import FeedItem from "./FeedItem";
import SearchBox from "./SearchBox";

interface FeedProps {
  profile: UserProfile;
  onEditProfile: () => void;
}

export default function Feed({ profile, onEditProfile }: FeedProps) {
  const [items, setItems] = useState<FeedItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  async function fetchFeed() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/curate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setItems(data.items);
      setHasLoaded(true);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">The Curator</h1>
            <p className="mt-0.5 text-sm text-zinc-500 max-w-sm truncate">{profile.topic}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchFeed}
              disabled={loading}
              className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm text-zinc-600 transition-colors hover:border-zinc-400 disabled:opacity-40"
            >
              {loading ? "Curating…" : "Refresh"}
            </button>
            <button
              onClick={onEditProfile}
              className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Settings
            </button>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && items.length === 0 && (
          <div className="flex flex-col gap-6">
            <p className="text-xs text-zinc-400 mb-2">Searching the web — this takes up to a minute…</p>
            {Array.from({ length: profile.volume }).map((_, i) => (
              <div key={i} className="border-b border-zinc-100 pb-6 animate-pulse">
                <div className="h-4 bg-zinc-100 rounded w-3/4 mb-3" />
                <div className="h-3 bg-zinc-100 rounded w-full mb-1.5" />
                <div className="h-3 bg-zinc-100 rounded w-5/6 mb-1.5" />
                <div className="h-3 bg-zinc-100 rounded w-4/6" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Feed items */}
        {items.length > 0 && (
          <div className="mb-8">
            {items.map((item) => (
              <FeedItem key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {hasLoaded && !loading && items.length === 0 && !error && (
          <p className="text-sm text-zinc-400 text-center py-10">
            Nothing found. Try refreshing or adjusting your topic.
          </p>
        )}

        {/* Search */}
        {hasLoaded && !loading && (
          <SearchBox profile={profile} />
        )}
      </div>
    </div>
  );
}
