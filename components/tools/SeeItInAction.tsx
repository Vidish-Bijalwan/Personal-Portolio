import ExplainerVideo from "@/components/tools/ExplainerVideo";
import { toolById } from "@/src/lib/tools/directory";
import { toolDetail, type ToolStep } from "@/src/lib/tools/details";

export interface SeeItInActionCustom {
  /** Display name, e.g. "Poster Studio". */
  name: string;
  /** Explainer video URL, e.g. "/tools/explainers/poster.mp4". */
  video: string;
  /** Poster frame URL (also the reduced-motion fallback). */
  poster: string;
  /** Accessible label for the video. */
  label: string;
  /** Exactly 3 honest steps. */
  steps: [ToolStep, ToolStep, ToolStep];
  /** One-line outcome caption ("What you get"). */
  outcome: string;
}

/**
 * "See it in action" — the one reusable demo block for every feature surface.
 *
 * Shows the feature's real explainer video (before → after, muted autoplay
 * loop) plus 3 honest steps and a one-line outcome caption, directly above
 * the upload/intake box — so a first-time visitor understands the feature
 * before handing over any file.
 *
 * Data comes from TOOL_DIRECTORY/TOOL_DETAILS for known tool ids; surfaces
 * that are not tools (e.g. Poster Studio) pass `custom` instead. Never
 * renders for unknown tool ids without custom data.
 */
export default function SeeItInAction({
  toolId,
  custom,
  className = "",
}: {
  toolId: string;
  custom?: SeeItInActionCustom;
  className?: string;
}) {
  const tool = toolById(toolId);
  const detail = tool ? toolDetail(toolId) : null;

  const name = custom?.name ?? tool?.name;
  const video = custom?.video ?? (tool ? `/tools/explainers/${tool.id}.mp4` : "");
  const poster = custom?.poster ?? (tool ? `/tools/explainers/${tool.id}-poster.jpg` : "");
  const steps = custom?.steps ?? detail?.steps;
  const outcome = custom?.outcome ?? tool?.delivers;

  if (!name || !video || !poster || !steps || !outcome) return null;

  const accent = "var(--pro-accent)";
  return (
    <section aria-label={`See ${name} in action`} className={className}>
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p
            className="font-display text-[12px] font-bold uppercase tracking-[0.18em]"
            style={{ color: accent }}
          >
            See it in action
          </p>
          <p className="text-[13px] text-white/55">{name}</p>
        </div>

        <div className="mt-4">
          <ExplainerVideo
            src={video}
            poster={poster}
            label={custom?.label ?? `How the ${name} tool works`}
          />
        </div>

        <ol className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span
                aria-hidden
                className="font-display text-[12px] font-bold tabular-nums"
                style={{ color: accent }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-[13.5px] font-semibold text-[#F5F5F3]">{s.title}</p>
                <p className="mt-1 text-[12.5px] leading-5 text-white/50">{s.copy}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-4 border-t border-white/[0.06] pt-3 text-[13px] leading-6 text-white/60">
          <span className="font-semibold text-white/85">What you get: </span>
          {outcome}
        </p>
      </div>
    </section>
  );
}
