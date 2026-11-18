export interface AlbumCreateInput {
  title: string;
  artistId: string;
  releaseDate: string;
  coverUrl?: string;
}

export interface AlbumUpdateInput {
  title?: string;
  artistId?: string;
  releaseDate?: string;
  coverUrl?: string;
}
