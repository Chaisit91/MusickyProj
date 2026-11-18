export interface AdsCreateInput {
  title: string;
  imageUrl: string;
  linkUrl: string;
  adType: string;
  adDuration: number;
  advertiser: string;
  isActive?: boolean;
  priority?: number;
  startDate?: string;
  endDate?: string;
}

export interface AdsUpdateInput {
  title?: string;
  imageUrl?: string;
  linkUrl?: string;
  adType?: string;
  adDuration?: number;
  advertiser?: string;
  isActive?: boolean;
  priority?: number;
  startDate?: string;
  endDate?: string;
}
