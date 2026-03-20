export interface Artist {
  id: string;
  name: string;
  bio?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArtistCreateInput {
  name: string;
  bio?: string;
  imageUrl?: string;
}

export interface ArtistUpdateInput {
  name?: string;
  bio?: string;
  imageUrl?: string;
}