import type { MetadataRoute } from "next";

/**
 * Web app manifest for Etch (served at /manifest.webmanifest).
 *
 * Includes the Web Share Target API registration so the installed PWA
 * appears in the OS share sheet: shared images/videos (+ optional
 * title/text/url) POST as multipart/form-data to /share-target, which
 * validates them with the existing Madam Muse upload policy and hands
 * them to the /create intake pre-attached.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Etch — AI images & video ads, pay per creation",
    short_name: "Etch",
    description:
      "Describe your ad in plain words, see the exact price before you pay. AI images from ₹19, video clips, human quality review.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#080808",
    theme_color: "#080808",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    share_target: {
      action: "/share-target",
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        title: "title",
        text: "text",
        url: "url",
        files: [{ name: "files", accept: ["image/*", "video/*"] }],
      },
    },
  };
}
