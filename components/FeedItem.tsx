"use client";

import type { FeedItem as FeedItemType } from "@/lib/types";

interface FeedItemProps {
  item: FeedItemType;
}

export default function FeedItem({ item }: FeedItemProps) {
  return (
    <article className="border-b border-zinc-100 py-6 last:border-b-0">
      <h2 className="text-base font-semibold leading-snug text-zinc-900 mb-2">
        {item.headline}
      </h2>
      <p className="text-sm leading-relaxed text-zinc-600">{item.whyThisMatters}</p>
      {item.source && (
        <p className="mt-2 text-xs text-zinc-400">{item.source}</p>
      )}
    </article>
  );
}
