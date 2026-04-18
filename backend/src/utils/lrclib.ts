import https from "https";

interface LRCLIBResponse {
  syncedLyrics?: string | null;
  plainLyrics?: string | null;
  instrumental?: boolean;
}

function httpsGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "MusickyApp/1.0 (github.com/musickyproj)" } }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

export async function fetchLyricsFromLRCLIB(
  title: string,
  artistName: string,
  albumName: string,
  duration: number
): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      track_name: title,
      artist_name: artistName,
      ...(albumName && { album_name: albumName }),
      ...(duration > 0 && { duration: String(Math.round(duration)) }),
    });

    const url = `https://lrclib.net/api/get?${params.toString()}`;
    const raw = await httpsGet(url);
    const json: LRCLIBResponse = JSON.parse(raw);

    if (json.instrumental) return null;

    // Prefer synced lyrics (LRC with timestamps) for beat-sync
    if (json.syncedLyrics?.trim()) return json.syncedLyrics.trim();
    if (json.plainLyrics?.trim()) return json.plainLyrics.trim();

    return null;
  } catch {
    return null;
  }
}
