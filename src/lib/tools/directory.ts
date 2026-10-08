/**
 * Etch — canonical tool directory.
 *
 * The single source of truth for every working tool on the site: the 4
 * composer services + the 8 Video Studio tools. The mega-dropdown, /tools
 * page, and any future directory surface all render from this list.
 *
 * HARD RULES:
 * - Only tools that genuinely work. Never add talking photo, voice cloning,
 *   AI song generation, AI influencer, translator/dubbing, or anything that
 *   isn't live right now.
 * - Every price is derived from the pricing catalog — zero hardcoded ₹
 *   literals in this file.
 */

import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  Captions,
  Clapperboard,
  FileAudio,
  Film,
  Image as ImageIcon,
  Layers,
  Mic,
  Minimize2,
  Scissors,
  ShoppingBag,
  Waves,
} from "lucide-react";
import { priceOf } from "@/lib/pricing/catalog";
import { formatINR } from "@/lib/vilish/types";

export type ToolGroup = "create" | "video-studio";

export interface ToolEntry {
  /** Stable id — matches the catalog id for create tools, the VideoTool string for studio tools. */
  id: string;
  name: string;
  /** Honest one-liner. */
  tagline: string;
  /** Catalog-derived display price (e.g. "₹19" or "₹39/job"). */
  price: string;
  /** Where the tool opens. */
  href: string;
  group: ToolGroup;
  icon: LucideIcon;
  /** "AI" for AI-generation tools, "Real processing" for ffmpeg/utility tools. */
  badge: "AI" | "Real processing";
  /** What the user walks away with — honest, no fake claims. */
  delivers: string;
}

const VS_JOB = `${formatINR(priceOf("video-studio"))}/job`;
/** Trivial converters (MP4→MP3, GIF, compressor): ₹5/job. */
const TOOL_BASIC = `${formatINR(priceOf("tool-basic"))}/job`;
/** Heavier re-encode jobs (trim & text, add-audio, denoise): ₹10/job. */
const TOOL_PLUS = `${formatINR(priceOf("tool-plus"))}/job`;

export const TOOL_DIRECTORY: readonly ToolEntry[] = [
  {
    id: "single-image",
    name: "AI Image",
    tagline: "Text to image — your aspect, your quality",
    price: formatINR(priceOf("single-image")),
    href: "/create",
    group: "create",
    icon: ImageIcon,
    badge: "AI",
    delivers: "1 HD image, watermarked preview first — pay to unlock the clean file",
  },
  {
    id: "pack-4",
    name: "4-pack",
    tagline: "Four images on one concept — iterate without paying four times",
    price: formatINR(priceOf("pack-4")),
    href: "/create?service=pack-4",
    group: "create",
    icon: Layers,
    badge: "AI",
    delivers: "4 variations on one brief, pick your favourite to unlock",
  },
  {
    id: "product-photo",
    name: "Product Photo",
    tagline: "Studio-grade shots for sellers",
    price: formatINR(priceOf("product-photo")),
    href: "/create?service=product-photo",
    group: "create",
    icon: ShoppingBag,
    badge: "AI",
    delivers: "Studio-lit product shot on a clean backdrop, HD download",
  },
  {
    id: "clip-5s",
    name: "5s Video Clip",
    tagline: "Prompt to video, made for reels",
    price: formatINR(priceOf("clip-5s")),
    href: "/create?media=video",
    group: "create",
    icon: Clapperboard,
    badge: "AI",
    delivers: "5-second HD clip, watermarked preview first — pay to unlock",
  },
  {
    id: "tts",
    name: "Voice-over",
    tagline: "AI narration, ducked under your audio",
    price: VS_JOB,
    href: "/video-studio",
    group: "video-studio",
    icon: Mic,
    badge: "AI",
    delivers: "Natural voice-over MP3 from your script, ready to drop into edits",
  },
  {
    id: "caption",
    name: "Captions",
    tagline: "Styled captions, burned in",
    price: VS_JOB,
    href: "/video-studio",
    group: "video-studio",
    icon: Captions,
    badge: "AI",
    delivers: "Timed captions file + burned-in video, synced to your audio",
  },
  {
    id: "trim",
    name: "Trim & text",
    tagline: "Cut + title card",
    price: TOOL_PLUS,
    href: "/video-studio",
    group: "video-studio",
    icon: Scissors,
    badge: "Real processing",
    delivers: "Trimmed clip with your text overlay, exported HD",
  },
  {
    id: "compress",
    name: "Compressor",
    tagline: "Shrink the file, keep the video",
    price: TOOL_BASIC,
    href: "/video-studio",
    group: "video-studio",
    icon: Minimize2,
    badge: "Real processing",
    delivers: "Smaller file, same watchable quality — pick the size",
  },
  {
    id: "convert",
    name: "MP4 → MP3",
    tagline: "Pull the audio out as MP3",
    price: TOOL_BASIC,
    href: "/video-studio",
    group: "video-studio",
    icon: FileAudio,
    badge: "Real processing",
    delivers: "Clean MP3 audio extracted from your MP4",
  },
  {
    id: "gif",
    name: "GIF maker",
    tagline: "Clip → shareable GIF",
    price: TOOL_BASIC,
    href: "/video-studio",
    group: "video-studio",
    icon: Film,
    badge: "Real processing",
    delivers: "Looping GIF from any moment of your video",
  },
  {
    id: "add-audio",
    name: "Add audio",
    tagline: "Lay music or VO over video",
    price: TOOL_PLUS,
    href: "/video-studio",
    group: "video-studio",
    icon: AudioLines,
    badge: "Real processing",
    delivers: "Your audio mixed under the video, levels balanced",
  },
  {
    id: "denoise",
    name: "Noise reducer",
    tagline: "Tame hum, hiss and rumble",
    price: TOOL_PLUS,
    href: "/video-studio",
    group: "video-studio",
    icon: Waves,
    badge: "Real processing",
    delivers: "Cleaner audio with background hiss removed",
  },
] as const;

export function toolsByGroup(group: ToolGroup): ToolEntry[] {
  return TOOL_DIRECTORY.filter((t) => t.group === group);
}

export function toolById(id: string): ToolEntry | undefined {
  return TOOL_DIRECTORY.find((t) => t.id === id);
}
