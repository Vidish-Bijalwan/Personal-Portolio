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
    tagline: "One image, from your words, in your aspect ratio",
    price: formatINR(priceOf("single-image")),
    href: "/create",
    group: "create",
    icon: ImageIcon,
    badge: "AI",
    delivers: "1 HD image. Preview it watermarked first — pay once to unlock the clean file",
  },
  {
    id: "pack-4",
    name: "4-pack",
    tagline: "Four takes on one idea — explore before you commit",
    price: formatINR(priceOf("pack-4")),
    href: "/create?service=pack-4",
    group: "create",
    icon: Layers,
    badge: "AI",
    delivers: "4 variations on one brief — unlock only your favourite",
  },
  {
    id: "product-photo",
    name: "Product Photo",
    tagline: "Listing-ready shots without a photo shoot",
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
    tagline: "A short video clip, generated for reels",
    price: formatINR(priceOf("clip-5s")),
    href: "/create?media=video",
    group: "create",
    icon: Clapperboard,
    badge: "AI",
    delivers: "5-second HD clip. Preview it watermarked first — pay once to unlock",
  },
  {
    id: "tts",
    name: "Voice-over",
    tagline: "A natural voice reading your script",
    price: VS_JOB,
    href: "/video-studio?tool=tts",
    group: "video-studio",
    icon: Mic,
    badge: "AI",
    delivers: "MP3 voice-over from your text, ready to drop into your edit",
  },
  {
    id: "caption",
    name: "Captions",
    tagline: "Readable captions, timed to your audio",
    price: VS_JOB,
    href: "/video-studio?tool=caption",
    group: "video-studio",
    icon: Captions,
    badge: "AI",
    delivers: "Timed captions burned into your video, synced to your audio",
  },
  {
    id: "trim",
    name: "Trim & text",
    tagline: "Cut to the moment, add a title",
    price: TOOL_PLUS,
    href: "/video-studio?tool=trim",
    group: "video-studio",
    icon: Scissors,
    badge: "Real processing",
    delivers: "Trimmed clip with your text overlay, exported in HD",
  },
  {
    id: "compress",
    name: "Compressor",
    tagline: "A smaller file that still looks good",
    price: TOOL_BASIC,
    href: "/video-studio?tool=compress",
    group: "video-studio",
    icon: Minimize2,
    badge: "Real processing",
    delivers: "Smaller file, same watchable quality — you pick how far to squeeze",
  },
  {
    id: "convert",
    name: "MP4 → MP3",
    tagline: "Keep the sound, skip the video",
    price: TOOL_BASIC,
    href: "/video-studio?tool=convert",
    group: "video-studio",
    icon: FileAudio,
    badge: "Real processing",
    delivers: "Clean MP3 audio extracted from your MP4",
  },
  {
    id: "gif",
    name: "GIF maker",
    tagline: "Any moment, as a looping GIF",
    price: TOOL_BASIC,
    href: "/video-studio?tool=gif",
    group: "video-studio",
    icon: Film,
    badge: "Real processing",
    delivers: "Optimized looping GIF from up to 10 seconds of your video",
  },
  {
    id: "add-audio",
    name: "Add audio",
    tagline: "Your soundtrack, mixed under your video",
    price: TOOL_PLUS,
    href: "/video-studio?tool=add-audio",
    group: "video-studio",
    icon: AudioLines,
    badge: "Real processing",
    delivers: "Your audio mixed over your video — or replacing it entirely",
  },
  {
    id: "denoise",
    name: "Noise reducer",
    tagline: "Less hum and hiss, more voice",
    price: TOOL_PLUS,
    href: "/video-studio?tool=denoise",
    group: "video-studio",
    icon: Waves,
    badge: "Real processing",
    delivers: "Cleaner audio with steady background noise reduced",
  },
] as const;

export function toolsByGroup(group: ToolGroup): ToolEntry[] {
  return TOOL_DIRECTORY.filter((t) => t.group === group);
}

export function toolById(id: string): ToolEntry | undefined {
  return TOOL_DIRECTORY.find((t) => t.id === id);
}
