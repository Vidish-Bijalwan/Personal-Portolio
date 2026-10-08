import VideoStudioPanel from "@/components/vilish/video-studio-panel";
import { VIDEO_TOOLS, type VideoTool } from "@/lib/video/constants";

export const metadata = {
  title: "Video Studio — AI voice-over, captions, trim & more | Etch",
  description:
    "Eight real video tools: AI voice-over, auto-captions, trim & text, compressor, MP4→MP3, GIF, denoise. Pay per finished video, UPI.",
};

export default async function VideoStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string }>;
}) {
  // Deep link support, e.g. /video-studio?tool=caption from the nav tools
  // dropdown or the /tools directory — opens with that tool pre-selected.
  const sp = await searchParams;
  const initialTool: VideoTool | undefined =
    sp?.tool && (VIDEO_TOOLS as readonly string[]).includes(sp.tool)
      ? (sp.tool as VideoTool)
      : undefined;
  return <VideoStudioPanel chrome initialTool={initialTool} />;
}
