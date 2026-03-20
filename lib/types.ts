export interface UserProfile {
  topic: string;
  contentTypes: string[];
  priorKnowledge: string;
  volume: number;
}

export interface FeedItem {
  id: string;
  headline: string;
  whyThisMatters: string;
  source?: string;
}

export interface CurateRequest {
  profile: UserProfile;
}

export interface CurateResponse {
  items: FeedItem[];
}

export interface SearchRequest {
  profile: UserProfile;
  question: string;
}
