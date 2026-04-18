"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findSongIdsByLyrics = findSongIdsByLyrics;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const client = new sdk_1.default({ apiKey: process.env.ANTHROPIC_API_KEY });
// ─── ส่งเนื้อเพลงจาก DB ให้ Claude หาเพลงที่ตรงกับ query ────────────────────
async function findSongIdsByLyrics(songs, query) {
    if (songs.length === 0)
        return [];
    const songList = songs
        .map((s, i) => `[${i}] id=${s.id} | "${s.title}" by ${s.artistName}\n${s.lyrics.slice(0, 800)}`)
        .join("\n\n---\n\n");
    const systemPrompt = "You are a music assistant. You will be given a list of songs with their lyrics and a lyric query from a user. " +
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
            .map((b) => b.text)
            .join("");
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch)
            return [];
        const ids = JSON.parse(jsonMatch[0]);
        return Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [];
    }
    catch (_a) {
        return [];
    }
}
//# sourceMappingURL=lyricsSearch.js.map