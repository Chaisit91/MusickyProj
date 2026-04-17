export interface ArtistCreateInput {
  name: string;
  bio?: string;
  imageUrl?: string;
}

export interface ArtistUpdateInput {
  name?: string;
  bio?: string | null;
  imageUrl?: string;
}
