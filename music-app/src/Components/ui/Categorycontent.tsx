import React from "react";
import {View,
  Text,
  ScrollView,
  TouchableOpacity} from "react-native";
import { router } from "expo-router";
import { Song, PlayHistoryItem, Genre, Artist } from "../../api/homeApi";
import { Playlist } from "../../store/librarySlice";
import { colorFor } from "../../constants";
import { PlayIcon } from "./icons";
import { Image } from "expo-image";

export type CategoryName = "For you" | "Relax" | "Workout" | "Travel" | "Party";

interface CategoryConfig {
  headline: string;
  subline: string;
  accentColor: string;
}

// Keywords used to filter genres/songs per mood category (case-insensitive contains)
export const CATEGORY_KEYWORDS: Record<CategoryName, string[]> = {
  "For you": [],
  "Relax": ["lo-fi", "lofi", "acoustic", "jazz", "classical", "soul", "r&b", "rnb", "chill", "ambient", "indie", "ballad", "slow", "soft"],
  "Workout": ["hip-hop", "hiphop", "rap", "rock", "electronic", "edm", "metal", "punk", "trap", "hardcore", "bass"],
  "Travel": ["folk", "indie", "pop", "world", "latin", "reggae", "country", "acoustic", "bossa", "alternative"],
  "Party": ["electronic", "dance", "pop", "hip-hop", "edm", "disco", "house", "techno", "latin", "funk", "club"],
};

function matchesCategory(name: string, keywords: string[]): boolean {
  if (keywords.length === 0) return true;
  const lower = name.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

const CATEGORY_CONFIG: Record<CategoryName, CategoryConfig> = {
  "For you": {
    headline: "Your Daily Mix",
    subline: "Handpicked just for you",
    accentColor: "#7c6af7",
  },
  Relax: {
    headline: "Today's Refreshing\nRecommendations",
    subline: "Calm your mind, ease into the moment",
    accentColor: "#4a9eff",
  },
  Workout: {
    headline: "Power Up Your\nTraining Session",
    subline: "High-energy tracks to push your limits",
    accentColor: "#ff5f3b",
  },
  Travel: {
    headline: "Soundtrack for\nYour Journey",
    subline: "Music that moves as you move",
    accentColor: "#00c896",
  },
  Party: {
    headline: "Get the Party\nStarted Now",
    subline: "Drop the beat and light it up",
    accentColor: "#f7c948",
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader = ({
  title,
  accent,
  onSeeMore,
}: {
  title: string;
  accent: string;
  onSeeMore?: () => void;
}) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      marginBottom: 14,
    }}
  >
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: accent }} />
      <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>{title}</Text>
    </View>
    {onSeeMore && (
      <TouchableOpacity onPress={onSeeMore} activeOpacity={0.7}>
        <Text style={{ color: "#aaa", fontSize: 13 }}>See more</Text>
      </TouchableOpacity>
    )}
  </View>
);

const BannerCard = ({
  title,
  subtitle,
  songs,
  accent,
  onPress,
}: {
  title: string;
  subtitle: string;
  songs: Song[];
  accent: string;
  onPress: () => void;
}) => {
  const covers = songs.slice(0, 6).map((s) => s.coverUrl ?? null);
  const W = 260;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        width: W,
        height: 160,
        borderRadius: 14,
        overflow: "hidden",
        marginRight: 14,
        backgroundColor: "#1a1a2e",
      }}
    >
      <View style={{ flex: 1, flexDirection: "row" }}>
        {[0, 1, 2].map((col) => (
          <View key={col} style={{ flex: 1, flexDirection: "column" }}>
            {[0, 1].map((row) => {
              const idx = col * 2 + row;
              const cover = covers[idx];
              return (
                <View key={row} style={{ flex: 1, backgroundColor: colorFor(idx) }}>
                  {cover ? (
                    <Image source={{ uri: cover }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}
      </View>
      <View
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 100,
          backgroundColor: "rgba(0,0,0,0.68)",
        }}
      />
      <View style={{ position: "absolute", bottom: 12, left: 12, right: 12 }}>
        <Text style={{ color: accent, fontSize: 9, fontWeight: "700", letterSpacing: 1.2, marginBottom: 3 }}>
          {subtitle.toUpperCase()}
        </Text>
        <Text style={{ color: "#fff", fontSize: 17, fontWeight: "900" }} numberOfLines={1}>
          {title.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const RecentCard = ({
  song,
  index,
  onPress,
}: {
  song: Song;
  index: number;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ marginRight: 14, width: 100 }}>
    <View
      style={{
        width: 100, height: 100, borderRadius: 10,
        overflow: "hidden", backgroundColor: colorFor(index), marginBottom: 7,
      }}
    >
      {song.coverUrl ? (
        <Image source={{ uri: song.coverUrl }} style={{ width: 100, height: 100 }} contentFit="cover" />
      ) : null}
      <View
        style={{
          position: "absolute", bottom: 6, right: 6,
          width: 28, height: 28, borderRadius: 14,
          backgroundColor: "rgba(0,0,0,0.72)",
          alignItems: "center", justifyContent: "center",
        }}
      >
        <PlayIcon size={12} />
      </View>
    </View>
    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }} numberOfLines={1}>
      {song.title}
    </Text>
    <Text style={{ color: "#888", fontSize: 10, marginTop: 2 }} numberOfLines={1}>
      {song.artist.name}
    </Text>
  </TouchableOpacity>
);

const MixCard = ({
  genre,
  index,
  coverSongs,
  onPress,
}: {
  genre: Genre;
  index: number;
  coverSongs: Song[];
  onPress: () => void;
}) => {
  const covers = coverSongs.slice(0, 4).map((s) => s.coverUrl ?? null);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ marginRight: 14, width: 140 }}>
      <View
        style={{
          width: 140, height: 140, borderRadius: 12,
          overflow: "hidden", backgroundColor: colorFor(index), marginBottom: 8,
        }}
      >
        {genre.imageUrl ? (
          <Image source={{ uri: genre.imageUrl }} style={{ width: 140, height: 140 }} contentFit="cover" />
        ) : (
          <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap" }}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={{ width: 70, height: 70, backgroundColor: colorFor(index + i + 1) }}>
                {covers[i] ? (
                  <Image source={{ uri: covers[i]! }} style={{ width: 70, height: 70 }} contentFit="cover" />
                ) : null}
              </View>
            ))}
          </View>
        )}
        <View
          style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
            backgroundColor: "rgba(0,0,0,0.52)",
          }}
        />
        <View style={{ position: "absolute", bottom: 9, left: 10, right: 10 }}>
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "800" }} numberOfLines={1}>{genre.name}</Text>
        </View>
      </View>
      <Text style={{ color: "#aaa", fontSize: 10, fontWeight: "500" }} numberOfLines={1}>
        {genre.name}
      </Text>
    </TouchableOpacity>
  );
};

const ArtistCard = ({
  artist,
  index,
  onPress,
}: {
  artist: Artist;
  index: number;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ marginRight: 14, width: 110, alignItems: "center" }}>
    <View
      style={{
        width: 110, height: 110, borderRadius: 55,
        overflow: "hidden", backgroundColor: colorFor(index), marginBottom: 8,
      }}
    >
      {artist.imageUrl ? (
        <Image source={{ uri: artist.imageUrl }} style={{ width: 110, height: 110 }} contentFit="cover" />
      ) : null}
    </View>
    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600", textAlign: "center" }} numberOfLines={1}>
      {artist.name}
    </Text>
  </TouchableOpacity>
);

const NewReleaseCard = ({
  song,
  index,
  onPress,
}: {
  song: Song;
  index: number;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ marginRight: 14, width: 120 }}>
    <View
      style={{
        width: 120, height: 120, borderRadius: 10,
        overflow: "hidden", backgroundColor: colorFor(index), marginBottom: 8,
      }}
    >
      {song.coverUrl ? (
        <Image source={{ uri: song.coverUrl }} style={{ width: 120, height: 120 }} contentFit="cover" />
      ) : null}
    </View>
    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }} numberOfLines={1}>
      {song.title}
    </Text>
    <Text style={{ color: "#888", fontSize: 10, marginTop: 2 }} numberOfLines={1}>
      {song.artist.name}
    </Text>
  </TouchableOpacity>
);

const PlaylistCard = ({
  playlist,
  index,
  onPress,
}: {
  playlist: Playlist;
  index: number;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ marginRight: 14, width: 140 }}>
    <View
      style={{
        width: 140, height: 140, borderRadius: 12,
        overflow: "hidden", backgroundColor: colorFor(index), marginBottom: 8,
      }}
    >
      {playlist.coverUrl ? (
        <Image source={{ uri: playlist.coverUrl }} style={{ width: 140, height: 140 }} contentFit="cover" />
      ) : null}
    </View>
    <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }} numberOfLines={1}>
      {playlist.title}
    </Text>
    <Text style={{ color: "#888", fontSize: 11, marginTop: 2 }}>{playlist.songs.length} songs</Text>
  </TouchableOpacity>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

interface CategoryContentProps {
  category: CategoryName;
  onSongPress: (song: Song) => void;
  featuringSongs: Song[];
  recentlyPlayed: PlayHistoryItem[];
  genres: Genre[];
  newReleases: Song[];
  followedArtists: Artist[];
  allArtists: Artist[];
  playlists: Playlist[];
  moodSongs?: Song[];
  loadingMoodSongs?: boolean;
}

export default function CategoryContent({
  category,
  onSongPress,
  featuringSongs,
  recentlyPlayed,
  genres,
  newReleases,
  followedArtists,
  allArtists,
  playlists,
  moodSongs,
  loadingMoodSongs,
}: CategoryContentProps) {
  const config = CATEGORY_CONFIG[category];
  const accent = config.accentColor;
  const keywords = CATEGORY_KEYWORDS[category];

  // For mood categories: use moodSongs (fetched by genre); fallback to filtered featuringSongs
  const categorySongs =
    category !== "For you" && moodSongs && moodSongs.length > 0
      ? moodSongs
      : category !== "For you"
      ? featuringSongs.filter((s) => matchesCategory(s.genre.name, keywords)).length > 0
        ? featuringSongs.filter((s) => matchesCategory(s.genre.name, keywords))
        : featuringSongs
      : featuringSongs;

  const filteredGenres = genres.filter((g) => matchesCategory(g.name, keywords));
  const categoryGenres = filteredGenres.length > 0 ? filteredGenres : genres;

  // For you: show all followed artists (or all artists as fallback)
  // Mood tabs: show only followed artists whose songs appear in this tab's pool;
  //            fallback to artists from the song pool if user follows none of them
  const songArtistIds = new Set(categorySongs.map((s) => s.artist.id));
  const relevantFollowed = followedArtists.filter((a) => songArtistIds.has(a.id));
  const songArtists = categorySongs
    .map((s) => s.artist)
    .filter((a, i, arr) => arr.findIndex((x) => x.id === a.id) === i);

  const displayArtists =
    category === "For you"
      ? followedArtists.length > 0 ? followedArtists : allArtists.slice(0, 6)
      : relevantFollowed.length > 0 ? relevantFollowed : songArtists.slice(0, 6);

  return (
    <View>
      {/* ── Category headline ── */}
      <View style={{ paddingHorizontal: 20, marginBottom: 22 }}>
        <Text style={{ color: accent, fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 6 }}>
          {category.toUpperCase()}
        </Text>
        <Text style={{ color: "#fff", fontSize: 24, fontWeight: "900", lineHeight: 30 }}>
          {config.headline}
        </Text>
        <Text style={{ color: "#666", fontSize: 13, marginTop: 6 }}>{config.subline}</Text>
      </View>

      {/* ── Featuring Today ── */}
      {categorySongs.length > 0 && (
        <>
          <SectionHeader title="Featuring Today" accent={accent} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          >
            <BannerCard
              title="Featured Songs"
              subtitle="New"
              songs={categorySongs}
              accent={accent}
              onPress={() => onSongPress(categorySongs[0])}
            />
            {categoryGenres.slice(0, 3).map((genre, gi) => (
              <BannerCard
                key={genre.id}
                title={genre.name}
                subtitle="Trending"
                songs={categorySongs.slice(gi * 2, gi * 2 + 6)}
                accent={accent}
                onPress={() =>
                  router.push({
                    pathname: "/genre/[id]",
                    params: {
                      id: genre.id,
                      name: encodeURIComponent(genre.name),
                      color: encodeURIComponent(genre.color ?? "#1a1a2e"),
                      imageUrl: encodeURIComponent(genre.imageUrl ?? ""),
                    },
                  })
                }
              />
            ))}
          </ScrollView>
        </>
      )}

      {/* ── Recently Played ── */}
      {recentlyPlayed.length > 0 && (
        <>
          <SectionHeader
            title="Recently Played"
            accent={accent}
            onSeeMore={() => router.push("/recently-played")}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            style={{ marginBottom: 28 }}
          >
            {recentlyPlayed.map((item, i) => (
              <RecentCard
                key={item.id}
                song={item.song}
                index={i}
                onPress={() => onSongPress(item.song)}
              />
            ))}
          </ScrollView>
        </>
      )}

      {/* ── Mixes for you ── */}
      {categoryGenres.length > 0 && (
        <>
          <SectionHeader title="Mixes for you" accent={accent} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            style={{ marginBottom: 28 }}
          >
            {categoryGenres.map((genre, gi) => (
              <MixCard
                key={genre.id}
                genre={genre}
                index={gi}
                coverSongs={categorySongs.slice((gi * 4) % Math.max(categorySongs.length, 1))}
                onPress={() =>
                  router.push({
                    pathname: "/genre/[id]",
                    params: {
                      id: genre.id,
                      name: encodeURIComponent(genre.name),
                      color: encodeURIComponent(genre.color ?? "#1a1a2e"),
                      imageUrl: encodeURIComponent(genre.imageUrl ?? ""),
                    },
                  })
                }
              />
            ))}
          </ScrollView>
        </>
      )}

      {/* ── From Artists You Follow ── */}
      {displayArtists.length > 0 && (
        <>
          <SectionHeader
            title={
              category === "Relax" ? "Artists to Unwind With" :
              category === "Workout" ? "Artists to Power Your Workout" :
              category === "Travel" ? "Artists for the Road" :
              category === "Party" ? "Artists to Get the Party Started" :
              "From Artists You Follow"
            }
            accent={accent}
            onSeeMore={() => router.push("/search")}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            style={{ marginBottom: 28 }}
          >
            {displayArtists.map((artist, i) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                index={i}
                onPress={() =>
                  router.push({ pathname: "/artist/[id]", params: { id: artist.id } })
                }
              />
            ))}
          </ScrollView>
        </>
      )}

      {/* ── New Releases ── */}
      {newReleases.length > 0 && (
        <>
          <SectionHeader title="New Releases" accent={accent} onSeeMore={() => router.push("/search")} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            style={{ marginBottom: 28 }}
          >
            {newReleases.map((song, i) => (
              <NewReleaseCard
                key={song.id}
                song={song}
                index={i}
                onPress={() => onSongPress(song)}
              />
            ))}
          </ScrollView>
        </>
      )}

      {/* ── Top Playlists ── */}
      {playlists.length > 0 && (
        <>
          <SectionHeader
            title="Top Playlists"
            accent={accent}
            onSeeMore={() => router.push("/your-library")}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            style={{ marginBottom: 28 }}
          >
            {playlists.map((pl, i) => (
              <PlaylistCard
                key={pl.id}
                playlist={pl}
                index={i}
                onPress={() =>
                  router.push({ pathname: "/playlist/[id]", params: { id: pl.id } })
                }
              />
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}
