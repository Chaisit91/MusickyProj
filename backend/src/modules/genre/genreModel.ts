export interface GenreCreateInput {
  name: string;
  description?: string;
  imageUrl?: string;
  color?: string;
}

export interface GenreUpdateInput {
  name?: string;
  description?: string;
  imageUrl?: string;
  color?: string;
}
