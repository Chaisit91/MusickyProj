import https from "https";

interface LRCLIBResponse {
  syncedLyrics?: string | null;
  plainLyrics?: string | null;
  instrumental?: boolean;
}

function httpsGet(url: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "MusickyApp/1.0 (github.com/musickyproj)" } }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body: data }));
      })
      .on("error", reject);
  });
}

function extractLyrics(json: LRCLIBResponse): string | null {
  if (json.instrumental) return null;
  if (json.syncedLyrics?.trim()) return json.syncedLyrics.trim();
  if (json.plainLyrics?.trim()) return json.plainLyrics.trim();
  return null;
}

// ลบส่วน (feat. ...) / [Live] / - Remaster ฯลฯ ออก แล้ว normalize whitespace
function normalizeTitle(s: string): string {
  return s
    .replace(/\s*[\(\[（【][^\)\]）】]*[\)\]）】]/g, "") // ลบ (…) และ […]
    .replace(/\s*-\s*(remaster(ed)?|remix|live|acoustic|version|edit|radio edit).*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeArtist(s: string): string {
  return s
    .replace(/\s*[,&]\s*.*/g, "")   // ตัดชื่อ artist ที่สอง เช่น "A & B" → "A"
    .replace(/\s+/g, " ")
    .trim();
}

async function searchLRCLIB(title: string, artist: string): Promise<string | null> {
  const params = new URLSearchParams({ track_name: title, artist_name: artist });
  const res = await httpsGet(`https://lrclib.net/api/search?${params.toString()}`);
  if (res.status !== 200) return null;
  const results: LRCLIBResponse[] = JSON.parse(res.body);
  if (!Array.isArray(results)) return null;
  for (const r of results) {
    const lyr = extractLyrics(r);
    if (lyr) return lyr;
  }
  return null;
}

export async function fetchLyricsFromLRCLIB(
  title: string,
  artistName: string,
  albumName: string,
  duration: number
): Promise<string | null> {
  console.log(`[lrclib] fetching: "${title}" by "${artistName}"`);
  try {
    // 1. Exact match ด้วยข้อมูลดิบ
    const params = new URLSearchParams({ track_name: title, artist_name: artistName });
    if (albumName) params.set("album_name", albumName);
    if (duration > 0) params.set("duration", String(Math.round(duration)));
    const exactUrl = `https://lrclib.net/api/get?${params.toString()}`;
    console.log(`[lrclib] step1 exact: ${exactUrl}`);
    const exactRes = await httpsGet(exactUrl);
    console.log(`[lrclib] step1 status: ${exactRes.status}`);
    if (exactRes.status === 200) {
      const lyrics = extractLyrics(JSON.parse(exactRes.body));
      if (lyrics) { console.log("[lrclib] found via exact match"); return lyrics; }
    }

    // 2. Search ด้วยข้อมูลดิบ
    console.log(`[lrclib] step2 search: track="${title}" artist="${artistName}"`);
    const raw = await searchLRCLIB(title, artistName);
    if (raw) { console.log("[lrclib] found via raw search"); return raw; }

    // 3. Search ด้วย title/artist ที่ normalize แล้ว
    const cleanTitle = normalizeTitle(title);
    const cleanArtist = normalizeArtist(artistName);
    console.log(`[lrclib] step3 normalized: track="${cleanTitle}" artist="${cleanArtist}"`);
    if (cleanTitle !== title || cleanArtist !== artistName) {
      const cleaned = await searchLRCLIB(cleanTitle, cleanArtist);
      if (cleaned) { console.log("[lrclib] found via normalized search"); return cleaned; }
    }

    // 4. Search ด้วย title อย่างเดียว
    console.log(`[lrclib] step4 title-only: "${cleanTitle}"`);
    if (cleanTitle) {
      const titleOnly = await searchLRCLIB(cleanTitle, "");
      if (titleOnly) { console.log("[lrclib] found via title-only search"); return titleOnly; }
    }

    console.log(`[lrclib] not found: "${title}" by "${artistName}"`);
    return null;
  } catch (err) {
    console.error("[lrclib] fetch error:", err);
    return null;
  }
}
