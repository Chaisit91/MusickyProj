import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface SongWithLyrics {
  id: string;
  title: string;
  artistName: string;
  lyrics: string;
}

// ─── ส่งเนื้อเพลงจาก DB ให้ Claude หาเพลงที่ตรงกับ query ────────────────────

export async function findSongIdsByLyrics(
  songs: SongWithLyrics[],
  query: string
): Promise<string[]> {
  if (songs.length === 0) return [];

  const songList = songs
    .map((s, i) => `[${i}] id=${s.id} | "${s.title}" by ${s.artistName}\n${s.lyrics.slice(0, 800)}`)
    .join("\n\n---\n\n");

  const systemPrompt =
    "You are a music assistant. You will be given a list of songs with their lyrics and a lyric query from a user. " +
    "Find all songs whose lyrics contain or closely match the query (exact or partial match, allow for minor differences). " +
    'Respond ONLY with a JSON array of matching song IDs, e.g. ["id1","id2"]. ' +
    "If no songs match, respond with []. No explanation, only the JSON array.";

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 256,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Lyric query: "${query}"\n\nSongs:\n${songList}`,
        },
      ],
    });

    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const ids = JSON.parse(jsonMatch[0]) as string[];
    return Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}
