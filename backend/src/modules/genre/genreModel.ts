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
export interface Genre {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: { songs: number };
}

export interface GenreCreateInput {
  name: string;
  description?: string;
  imageUrl?: string;
  color?: string;
  imageFile?: File; 
}

export interface GenreUpdateInput {
  name?: string;
  description?: string;
  imageUrl?: string;
  color?: string;
  imageFile?: File; 
}