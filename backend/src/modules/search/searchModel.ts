export interface SearchHistoryCreateInput {
  userId: string;
  query: string;
}

export interface SearchHistoryItemCreateInput {
  userId: string;
  itemId: string;
  itemType: string;
  title: string;
  subtitle: string;
  coverUrl?: string | null;
}
