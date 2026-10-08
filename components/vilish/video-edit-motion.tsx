"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import "./video-edit-motion.css";
import {
  EDIT_MOTION_STAGES,
  clampProcessingProgress,
  editMotionStageIndex,
  monotonicProgress,
  monotonicStage,
  type EditMotionStageIndex,
} from "@/src/lib/vilish/edit-motion";
import { cn } from "@/lib/utils";

/**
 * VideoEditMotion — the "Editing your video" processing experience.
 *
 * A live editorial film-collage motion piece (black / cream / muted antique
 * gold, restrained burnt-red) that plays while a video-studio job processes.
 *
 * REAL DATA ONLY:
 * - `progress` comes from progressForStage(stage, status) on the
 *   watch page — the honest backend pipeline position. It is clamped to 99
 *   and made monotonic here, so the bar eases forward in milestones and can
 *   never jump backwards or show 100% early.
 * - `stageText` is displayStage(data.stage) — the watcher's own words.
 * - The four motion stages (Analyzing footage → Understanding style →
 *   Generating edit → Finalizing) derive from that same real progress.
 *
 * The ~7.5s staged entrance plays once; ambient loops (grain, waveform,
 * collage drift) run from t=0 with negative delays so the handoff into the
 * idle loop is invisible. prefers-reduced-motion → calm static scene.
 */

const WAVE_BARS = 56;

/** Deterministic bar heights — stable across renders, no Math.random. */
function waveHeights(): number[] {
  const out: number[] = [];
  for (let i = 0; i < WAVE_BARS; i++) {
    const x = Math.sin(i * 12.9898) * 43758.5453;
    out.push(0.28 + 0.72 * Math.abs(x - Math.floor(x)));
  }
  return out;
}

/** Which thumb is "selected" per stage — the edit visibly works on it.
 *  Kept clear of the choreography thumbs (t2 cut, t4 tighten, t5 slide,
 *  t7 new) so the entrance animations never fight the selection state. */
const SEL_BY_STAGE: Record<EditMotionStageIndex, number> = { 0: 1, 1: 3, 2: 6, 3: 0 };

export default function VideoEditMotion({
  progress,
  status,
  stageText,
  toolLabel,
  badge,
  caption,
}: {
  /** Real backend progress 0–100 (progressForStage). Never faked. */
  progress: number;
  /** Raw job status ("queued" | "processing" | …). */
  status: string;
  /** Polished stage copy (displayStage). */
  stageText: string;
  /** Tool label, e.g. "Voice-over". */
  toolLabel: string;
  /** Tool badge, e.g. "AI-generated". */
  badge: string;
  /** Rotating tool caption line. */
  caption: string;
}) {
  // Displayed progress: monotonic + clamped to 99 while processing.
  const [shown, setShown] = useState(() => clampProcessingProgress(progress));
  useEffect(() => {
    setShown((p) => monotonicProgress(p, progress));
  }, [progress]);

  // Motion stage: monotonic, derived from the same real progress.
  const [stage, setStage] = useState<EditMotionStageIndex>(() =>
    editMotionStageIndex(shown, status),
  );
  useEffect(() => {
    setStage((s) => monotonicStage(s, editMotionStageIndex(shown, status)));
  }, [shown, status]);

  const bars = useMemo(waveHeights, []);
  const selIdx = SEL_BY_STAGE[stage];
  // The scanning highlight rides with the real playhead position.
  const hotCutoff = Math.round((shown / 100) * WAVE_BARS);

  return (
    <section className="vse" aria-label="Editing your video">
      {/* collage backdrop */}
      <div className="vse-collage" aria-hidden="true">
        <div className="vse-paper-a" />
        <div className="vse-paper-b" />
        <div className="vse-paper-c" />
        <div className="vse-film-a" />
        <div className="vse-film-b" />
        <div className="vse-goldline" />
        <div className="vse-note vse-note-a">
          A Bigger
          <br />
          Story
          <br />
          Ahead.
        </div>
        <div className="vse-note vse-note-b">TURN FOOTAGE INTO SOMETHING MORE</div>
      </div>
      <div className="vse-grain" aria-hidden="true" />
      <div className="vse-scratch vse-scratch-a" aria-hidden="true" />
      <div className="vse-scratch vse-scratch-b" aria-hidden="true" />
      <div className="vse-dust vse-dust-a" aria-hidden="true" />
      <div className="vse-dust vse-dust-b" aria-hidden="true" />
      <div className="vse-dust vse-dust-c" aria-hidden="true" />
      <div className="vse-leak" aria-hidden="true" />

      <div className="vse-inner">
        <p className="vse-kicker">
          {toolLabel} · {badge}
        </p>
        <h1 className="vse-headline">
          <span className="vse-mask">
            <span className="vse-line vse-line-1">Editing</span>
          </span>{" "}
          <span className="vse-mask">
            <span className="vse-line vse-line-2">your video</span>
          </span>
        </h1>
        <p className="vse-sub">
          Our AI is analyzing your footage, understanding the scenes, and
          crafting your edit. This will only take a moment.
        </p>

        {/* stage rail — real backend stage */}
        <div className="vse-rail" role="list" aria-label="Edit stages">
          {EDIT_MOTION_STAGES.map((label, i) => {
            const done = i < stage;
            const active = i === stage;
            return (
              <div
                key={label}
                role="listitem"
                aria-current={active ? "step" : undefined}
                className={cn(
                  "vse-stage",
                  done && "is-done",
                  active && "is-active",
                )}
              >
                <span className="vse-node" aria-hidden="true">
                  {done ? (
                    <Check className="vse-check" strokeWidth={3} />
                  ) : (
                    <>
                      <span className="vse-dot" />
                      {active && <span className="vse-sweep" />}
                    </>
                  )}
                </span>
                <span className="vse-stage-label">{label}</span>
                <span className="vse-link" aria-hidden="true">
                  <span className="vse-link-fill" />
                </span>
              </div>
            );
          })}
          <div className="vse-pct" aria-hidden="true">
            {shown}%
          </div>
        </div>

        {/* main panel */}
        <div
          className={cn("vse-panel", stage >= 2 && "is-settling")}
          role="progressbar"
          aria-label="Video edit progress"
          aria-valuenow={shown}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="vse-preview" aria-hidden="true">
            <div className="vse-pv vse-pv-base" />
            <div className="vse-pv vse-pv-red" />
            <div className="vse-pv vse-pv-film" />
            <div className="vse-pv vse-pv-paper">
              <span>
                pace
                <br />
                rhythm
                <br />
                tone
              </span>
            </div>
            <div className="vse-pv vse-pv-brush">
              <svg viewBox="0 0 200 26" preserveAspectRatio="none">
                <path
                  d="M2 14 C 40 6, 80 20, 120 10 S 180 16, 198 12 L 198 20 C 150 24, 90 16, 50 22 S 10 20, 2 18 Z"
                  fill="#b3402e"
                />
              </svg>
            </div>
            <div className="vse-pv vse-pv-frame" />
          </div>

          <div className="vse-timeline">
            <div className="vse-tl-row">
              <span className="vse-playbtn" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 2.5v11l9-5.5z" />
                </svg>
              </span>
              <div className="vse-thumbs" aria-hidden="true">
                {Array.from({ length: 8 }, (_, i) => (
                  <span
                    key={i}
                    style={{ ["--d" as string]: `${i * 0.09}s` }}
                    className={cn(
                      "vse-thumb",
                      `t${i}`,
                      i === selIdx && "is-sel",
                      i === 2 && "is-cut",
                      i === 4 && "is-tight",
                      i === 5 && "is-slide",
                      i === 7 && "is-new",
                    )}
                  />
                ))}
                <span
                  className="vse-playhead"
                  style={{ left: `${shown}%` }}
                />
              </div>
            </div>
            <div className="vse-wave" aria-hidden="true">
              <svg viewBox={`0 0 ${WAVE_BARS * 10} 34`} preserveAspectRatio="none">
                {bars.map((h, i) => (
                  <rect
                    key={i}
                    className={cn("vse-wbar", i < hotCutoff && "hot")}
                    x={i * 10 + 3}
                    y={34 * (1 - h)}
                    width={4}
                    height={34 * h}
                    rx={2}
                    style={{ animationDelay: `${-(i * 0.23)}s` }}
                  />
                ))}
              </svg>
              <span className="vse-wave-scan" />
            </div>
            <div className="vse-bar" aria-hidden="true">
              <div className="vse-bar-fill" style={{ width: `${shown}%` }} />
            </div>
          </div>
        </div>

        <p className="vse-status">
          <span className="vse-livedot" aria-hidden="true" />
          <span>{stageText}</span>
          {caption ? <span aria-hidden="true">· {caption}</span> : null}
        </p>
      </div>
    </section>
  );
}
