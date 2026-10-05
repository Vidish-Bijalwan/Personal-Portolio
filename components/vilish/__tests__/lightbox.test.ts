import { describe, expect, it, vi } from "vitest";
import {
  handleLightboxKey,
  nextLightboxIndex,
} from "../lightbox-logic";
import {
  resolveOpenLightbox,
  toLightboxItem,
  type ExampleItem,
} from "../examples";

const MANIFEST: ExampleItem[] = [
  {
    src: "/examples/1-sneaker-ad.webp",
    prompt: "Floating sneaker, studio shot",
    price: "₹29",
    model: "flux-2",
    category: "ad",
  },
  {
    src: "/examples/2-neon-portrait.webp",
    prompt: "Neon portrait, city lights",
    price: "₹29",
    model: "flux-2",
    category: "image",
  },
  {
    src: "/examples/6-movie-poster.webp",
    prompt: "Astronaut before the monolith",
    price: "₹29",
    model: "flux-2",
    category: "image",
  },
];

describe("toLightboxItem (thumbnail click → lightbox data)", () => {
  it("maps the manifest item onto the shared lightbox shape", () => {
    expect(toLightboxItem(MANIFEST[0])).toEqual({
      src: "/examples/1-sneaker-ad.webp",
      caption: "Floating sneaker, studio shot",
      price: "₹29",
      model: "flux-2",
      badge: "Ad",
      alt: "Floating sneaker, studio shot",
      kind: "image",
      poster: undefined,
    });
  });

  it("maps a video manifest item to a video lightbox item", () => {
    expect(
      toLightboxItem({
        src: "/examples/videos/clip-1-portrait.mp4",
        prompt: "AI video example — animated neon portrait loop",
        price: "₹99",
        model: "5s clip",
        category: "video",
        poster: "/examples/videos/poster-1-portrait.jpg",
        alt: "AI-generated video example: neon portrait",
      }),
    ).toEqual({
      src: "/examples/videos/clip-1-portrait.mp4",
      caption: "AI video example — animated neon portrait loop",
      price: "₹99",
      model: "5s clip",
      badge: "Video",
      alt: "AI-generated video example: neon portrait",
      kind: "video",
      poster: "/examples/videos/poster-1-portrait.jpg",
    });
  });

  it("labels the category badge honestly per category", () => {
    expect(toLightboxItem(MANIFEST[1]).badge).toBe("Image");
    expect(
      toLightboxItem({ ...MANIFEST[1], category: "video" }).badge,
    ).toBe("Video");
    expect(toLightboxItem({ ...MANIFEST[1], category: "edit" }).badge).toBe(
      "Edit",
    );
  });
});

describe("resolveOpenLightbox (grid click wiring)", () => {
  it("returns null when no thumbnail is open", () => {
    expect(resolveOpenLightbox(MANIFEST, null)).toBeNull();
  });

  it("returns null for an out-of-range index", () => {
    expect(resolveOpenLightbox(MANIFEST, 99)).toBeNull();
  });

  it("opens the lightbox with the clicked thumbnail's image data", () => {
    const opened = resolveOpenLightbox(MANIFEST, 2);
    expect(opened).not.toBeNull();
    expect(opened!.index).toBe(2);
    expect(opened!.items).toHaveLength(3);
    // The clicked item's exact data reaches the lightbox:
    expect(opened!.items[2]).toMatchObject({
      src: "/examples/6-movie-poster.webp",
      caption: "Astronaut before the monolith",
      price: "₹29",
    });
    // …and the other items keep their own data (no cross-contamination):
    expect(opened!.items[0].caption).toBe("Floating sneaker, studio shot");
  });
});

describe("nextLightboxIndex", () => {
  it("moves forward and backward", () => {
    expect(nextLightboxIndex(0, 4, 1)).toBe(1);
    expect(nextLightboxIndex(2, 4, -1)).toBe(1);
  });

  it("wraps around both ends", () => {
    expect(nextLightboxIndex(3, 4, 1)).toBe(0);
    expect(nextLightboxIndex(0, 4, -1)).toBe(3);
  });

  it("leaves the index alone when the set is empty", () => {
    expect(nextLightboxIndex(0, 0, 1)).toBe(0);
  });
});

describe("handleLightboxKey", () => {
  it("Escape closes the lightbox and does not navigate", () => {
    const onClose = vi.fn();
    const onIndex = vi.fn();
    handleLightboxKey("Escape", 1, 3, onClose, onIndex);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onIndex).not.toHaveBeenCalled();
  });

  it("ArrowRight advances to the next image", () => {
    const onClose = vi.fn();
    const onIndex = vi.fn();
    handleLightboxKey("ArrowRight", 1, 3, onClose, onIndex);
    expect(onIndex).toHaveBeenCalledWith(2);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("ArrowLeft goes to the previous image", () => {
    const onIndex = vi.fn();
    handleLightboxKey("ArrowLeft", 1, 3, vi.fn(), onIndex);
    expect(onIndex).toHaveBeenCalledWith(0);
  });

  it("arrows wrap around at the ends", () => {
    const onIndex = vi.fn();
    handleLightboxKey("ArrowRight", 2, 3, vi.fn(), onIndex);
    expect(onIndex).toHaveBeenCalledWith(0);
    handleLightboxKey("ArrowLeft", 0, 3, vi.fn(), onIndex);
    expect(onIndex).toHaveBeenCalledWith(2);
  });

  it("arrows are a no-op for a single-image set", () => {
    const onClose = vi.fn();
    const onIndex = vi.fn();
    handleLightboxKey("ArrowRight", 0, 1, onClose, onIndex);
    handleLightboxKey("ArrowLeft", 0, 1, onClose, onIndex);
    expect(onClose).not.toHaveBeenCalled();
    expect(onIndex).not.toHaveBeenCalled();
  });

  it("ignores unrelated keys", () => {
    const onClose = vi.fn();
    const onIndex = vi.fn();
    for (const key of ["Enter", " ", "Tab", "a"]) {
      handleLightboxKey(key, 1, 3, onClose, onIndex);
    }
    expect(onClose).not.toHaveBeenCalled();
    expect(onIndex).not.toHaveBeenCalled();
  });
});
