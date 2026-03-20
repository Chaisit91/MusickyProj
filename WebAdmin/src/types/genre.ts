export interface Genre {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenreCreateInput {
  name: string;
}

export interface GenreUpdateInput {
  name?: string;
}