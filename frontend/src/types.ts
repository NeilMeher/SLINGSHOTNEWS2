
export interface NewsItem {
  id: string;
  category: string;
  categoryColor: string;
  time: string;
  title: string;
  bullets: string[];
  source: string;
  sourceLogo: string;
  image: string;
  stats: {
    w: string;
    mid: string;
    reaction: string;
    reactionEmoji: string;
    cap: string;
  };
}

export type ViewType = 'feed' | 'trending' | 'profile';
