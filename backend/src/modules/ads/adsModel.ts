export interface AdsCreateInput {
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive?: boolean;
}

export interface AdsUpdateInput {
  title?: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive?: boolean;
}