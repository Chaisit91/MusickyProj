import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./store";

// ─── Library selectors ────────────────────────────────────────────────────────

const selectLikedSongs      = (s: RootState) => s.library.likedSongs;
const selectDownloadedSongs = (s: RootState) => s.library.downloadedSongs;
const selectFollowedArtists = (s: RootState) => s.library.followedArtists;

// Factory selectors — memoized per songId/artistId so components only re-render
// when the liked/downloaded/following status of THAT specific item changes,
// not every time any item in the array changes.

export const makeSelectIsLiked = (songId: string) =>
  createSelector(selectLikedSongs, (songs) => songs.some((s) => s.id === songId));

export const makeSelectIsDownloaded = (songId: string) =>
  createSelector(selectDownloadedSongs, (songs) => songs.some((s) => s.id === songId));

export const makeSelectIsFollowing = (artistId: string) =>
  createSelector(selectFollowedArtists, (artists) => artists.some((a) => a.id === artistId));

// ─── Player selectors ─────────────────────────────────────────────────────────

export const selectCurrentSong   = (s: RootState) => s.player.currentSong;
export const selectIsPlaying     = (s: RootState) => s.player.isPlaying;
export const selectProgressSecs  = (s: RootState) => s.player.progressSeconds;
export const selectDurationSecs  = (s: RootState) => s.player.durationSeconds;
export const selectQueue         = (s: RootState) => s.player.queue;
export const selectCurrentIndex  = (s: RootState) => s.player.currentIndex;
export const selectRepeatMode    = (s: RootState) => s.player.repeatMode;
export const selectIsShuffle     = (s: RootState) => s.player.isShuffle;
export const selectVolume        = (s: RootState) => s.player.volume;
export const selectSeekRequest   = (s: RootState) => s.player.seekRequest;

// ─── Auth selectors ───────────────────────────────────────────────────────────

export const selectUser       = (s: RootState) => s.auth.user;
export const selectIsPremium  = (s: RootState) => s.auth.user?.isPremium ?? false;
export const selectIsLoggedIn = (s: RootState) => s.auth.isLoggedIn;

// ─── Notification selectors ───────────────────────────────────────────────────

export const selectUnreadCount = createSelector(
  (s: RootState) => s.notifications.items,
  (items) => items.filter((n) => !n.isRead).length
);
