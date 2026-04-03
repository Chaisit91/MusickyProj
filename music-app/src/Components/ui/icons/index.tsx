import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

// ─── Play / Pause ─────────────────────────────────────────────────────────────

export const PlayIcon = ({
  size = 22,
  color = "#fff",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill={color} d="M8 5v14l11-7z" />
  </Svg>
);

export const PauseIcon = ({
  size = 22,
  color = "#fff",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill={color} d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </Svg>
);

// ─── Heart / Like ─────────────────────────────────────────────────────────────

export const HeartIcon = ({
  filled = false,
  size = 22,
}: {
  filled?: boolean;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={filled ? "#e74c3c" : "none"}
      stroke={filled ? "#e74c3c" : "#aaa"}
      strokeWidth={1.8}
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
    />
  </Svg>
);

/** Pink-filled heart used on the Liked Songs screen */
export const HeartFilledIcon = ({
  size = 18,
  color = "#e84393",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
    />
  </Svg>
);

// ─── Navigation ───────────────────────────────────────────────────────────────

/** Left arrow (back) */
export const BackIcon = ({
  size = 24,
  color = "#fff",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
    />
  </Svg>
);

/** Chevron pointing down — used to collapse the player */
export const ChevronDown = ({
  size = 28,
  color = "#fff",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill={color} d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
  </Svg>
);

// ─── Download ─────────────────────────────────────────────────────────────────

export const DownloadIcon = ({
  downloaded = false,
  size = 18,
}: {
  downloaded?: boolean;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={downloaded ? "#4fc3f7" : "#555"}
      d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
    />
  </Svg>
);

// ─── Skip controls ────────────────────────────────────────────────────────────

export const SkipNextIcon = ({
  size = 30,
  color = "#fff",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"
    />
  </Svg>
);

export const SkipPrevIcon = ({
  size = 30,
  color = "#fff",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill={color} d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
  </Svg>
);

// ─── Shuffle ──────────────────────────────────────────────────────────────────

export const ShuffleIcon = ({
  active = false,
  size = 22,
}: {
  active?: boolean;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={active ? "#fff" : "#555"}
      d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"
    />
  </Svg>
);

// ─── Repeat ───────────────────────────────────────────────────────────────────

export const RepeatIcon = ({
  mode = "none",
  size = 22,
}: {
  mode?: "none" | "all" | "one";
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={mode === "none" ? "#555" : "#fff"}
      d={
        mode === "one"
          ? "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"
          : "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"
      }
    />
  </Svg>
);

// ─── More / Ellipsis ──────────────────────────────────────────────────────────

/** Horizontal three-dot menu */
export const MoreIcon = ({
  size = 18,
  color = "#666",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={5} cy={12} r={2} fill={color} />
    <Circle cx={12} cy={12} r={2} fill={color} />
    <Circle cx={19} cy={12} r={2} fill={color} />
  </Svg>
);

/** Vertical three-dot menu */
export const MoreVertIcon = ({
  size = 24,
  color = "#aaa",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={5} r={2} fill={color} />
    <Circle cx={12} cy={12} r={2} fill={color} />
    <Circle cx={12} cy={19} r={2} fill={color} />
  </Svg>
);

// ─── Share ────────────────────────────────────────────────────────────────────

export const ShareIcon = ({
  size = 22,
  color = "#aaa",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"
    />
  </Svg>
);

// ─── Close ────────────────────────────────────────────────────────────────────

export const CloseIcon = ({
  size = 14,
  color = "#666",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
    />
  </Svg>
);

// ─── Volume ───────────────────────────────────────────────────────────────────

export const VolumeLowIcon = ({
  size = 18,
  color = "#aaa",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"
    />
  </Svg>
);

export const VolumeHighIcon = ({
  size = 18,
  color = "#aaa",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
    />
  </Svg>
);

// ─── Device ───────────────────────────────────────────────────────────────────

export const DeviceIcon = ({
  size = 16,
  color = "#aaa",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M17 1H7C5.9 1 5 1.9 5 3v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14zm-5 2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"
    />
  </Svg>
);

// ─── Music note ───────────────────────────────────────────────────────────────

export const MusicNoteIcon = ({
  size = 32,
  color = "#ffffff40",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill={color}
      d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
    />
  </Svg>
);
