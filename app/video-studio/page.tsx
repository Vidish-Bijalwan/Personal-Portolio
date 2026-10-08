import VideoStudioPanel from "@/components/vilish/video-studio-panel";

export const metadata = {
  title: "Video Studio — AI voice-over, captions, trim & more | Etch",
  description:
    "Eight real video tools: AI voice-over, auto-captions, trim & text, compressor, MP4→MP3, GIF, denoise. Pay per finished video, UPI.",
};

export default function VideoStudioPage() {
  return <VideoStudioPanel chrome />;
}
