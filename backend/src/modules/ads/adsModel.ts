export interface AdsCreateInput {
  title: string;
  imageUrl: string;
  linkUrl: string;
  adType: string;
  adDuration: number;
  advertiser: string;
  isActive?: boolean;
}

export interface AdsUpdateInput {
  title?: string;
  imageUrl?: string;
  linkUrl?: string;
  adType?: string;
  adDuration?: number;
  advertiser?: string;
  isActive?: boolean;
}
