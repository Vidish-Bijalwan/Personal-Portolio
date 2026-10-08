/**
 * Sample output — a styled mock of what a poster template generates.
 *
 * Composed entirely from the template's own data: the field values
 * (headline, subtext, badge/date/discount, CTA), the selected palette's
 * swatches, and layout/typography hints interpreted from the template's
 * style direction (see @/lib/posters/sample-output).
 *
 * Purely presentational: parents own the fields + palette state, so the
 * mock re-renders live as the user edits. Sizes use container-query units
 * so the mock scales cleanly at any width. No animations.
 */
import { paletteFor } from "@/lib/posters/compose";
import { contrastText, shade, styleFlags } from "@/lib/posters/sample-output";
import type { PosterTemplate } from "@/data/poster-templates/templates";

interface SampleOutputProps {
  template: PosterTemplate;
  fields: Record<string, string>;
  paletteId: string;
}

export default function SampleOutput({
  template,
  fields,
  paletteId,
}: SampleOutputProps) {
  const palette = paletteFor(template, paletteId);
  const flags = styleFlags(template.style);
  const [bg, accent] = palette.swatches;
  const bgDeep = shade(bg, 0.32);
  const ink = contrastText(bg);
  const accentInk = contrastText(accent);

  // Empty input falls back to the template default so the mock never
  // renders a broken-looking blank poster mid-typing.
  const value = (key: string): string => {
    const raw = (fields[key] ?? "").trim();
    if (raw) return raw;
    return template.fields.find((f) => f.key === key)?.default ?? "";
  };

  const headline = value("headline");
  const subtext = value("subtext");
  const badge = value("badge");
  const date = value("date");
  const discount = value("discount");
  const cta = value("cta");

  const headlineClass = flags.script
    ? "font-serif italic"
    : flags.serif
      ? "font-serif font-semibold"
      : "font-black uppercase tracking-tight";
  const headlineSize = flags.airy ? "10cqw" : flags.script || flags.serif ? "11.5cqw" : "13cqw";

  return (
    <div
      role="img"
      aria-label={`Sample output mock for the ${template.name} template: ${headline}`}
      className="[container-type:inline-size] relative aspect-[4/5] w-full select-none overflow-hidden rounded-[14px]"
      style={{
        background: `linear-gradient(165deg, ${bg} 0%, ${bgDeep} 90%)`,
        boxShadow: "var(--pro-card-shadow)",
      }}
    >
      {/* soft accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[12%] left-1/2 h-[60%] w-[130%] -translate-x-1/2 rounded-[100%] opacity-25 blur-2xl"
        style={{ background: accent }}
      />

      {/* badge / sticker */}
      {badge && (
        <div
          className={
            flags.roundBadge
              ? "absolute right-[6%] top-[5%] z-10 flex aspect-square w-[26%] items-center justify-center rounded-full text-center"
              : "absolute right-[6%] top-[6%] z-10 rounded-[10px] px-[5%] py-[2.5%]"
          }
          style={{
            background: accent,
            color: accentInk,
            transform: `rotate(${flags.slanted ? 10 : 6}deg)`,
            boxShadow: "0 8px 20px rgba(0,0,0,0.28)",
          }}
        >
          <span
            className="font-black uppercase leading-[1.08] tracking-wide"
            style={{ fontSize: "5cqw" }}
          >
            {badge}
          </span>
        </div>
      )}

      {discount ? (
        /* discount-as-hero layout (e.g. Mega Sale) */
        <>
          <p
            className="absolute inset-x-0 top-[9%] px-[9%] text-center"
            style={{
              color: ink,
              fontSize: flags.airy ? "7.5cqw" : "9cqw",
              transform: flags.slanted ? "rotate(-2deg)" : undefined,
            }}
          >
            <span className={headlineClass} style={{ lineHeight: 1.04 }}>
              {headline}
            </span>
          </p>
          <p
            className="absolute inset-x-0 top-[30%] text-center font-black leading-none tracking-tight"
            style={{
              color: accent,
              fontSize: "25cqw",
              textShadow: "0 10px 32px rgba(0,0,0,0.32)",
            }}
          >
            {discount}
          </p>
          {subtext && (
            <p
              className="absolute inset-x-0 top-[63%] px-[10%] text-center leading-snug"
              style={{ color: ink, fontSize: "5cqw", opacity: 0.88 }}
            >
              {subtext}
            </p>
          )}
        </>
      ) : (
        /* standard layout: headline block, optional date chip */
        <div
          className="absolute inset-x-0 px-[9%] text-center"
          style={{
            top: flags.airy ? "21%" : "17%",
            transform: flags.slanted ? "rotate(-2deg)" : undefined,
          }}
        >
          <p className={headlineClass} style={{ color: ink, fontSize: headlineSize, lineHeight: 1.02 }}>
            {headline}
          </p>
          {subtext && (
            <p
              className="mx-auto mt-[4%] max-w-[92%] leading-snug"
              style={{ color: ink, fontSize: "4.8cqw", opacity: 0.86 }}
            >
              {subtext}
            </p>
          )}
          {date && (
            <p className="mt-[5%] flex justify-center">
              <span
                className="rounded-full font-bold uppercase"
                style={{
                  background: accent,
                  color: accentInk,
                  fontSize: "4.4cqw",
                  letterSpacing: "0.12em",
                  padding: "2.4% 7%",
                }}
              >
                {date}
              </span>
            </p>
          )}
        </div>
      )}

      {/* CTA bar */}
      {cta && (
        <div className="absolute inset-x-0 bottom-[6.5%] flex justify-center px-[9%]">
          <span
            className="rounded-full font-bold uppercase"
            style={{
              background: accent,
              color: accentInk,
              fontSize: "4.4cqw",
              letterSpacing: "0.16em",
              padding: "3.4% 11%",
              boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
            }}
          >
            {cta}
          </span>
        </div>
      )}
    </div>
  );
}
