"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import "./image-develop-motion.css";
import {
  CONTACT_SHEET_MILESTONES,
  IMAGE_MOTION_STAGES,
  clampProcessingProgress,
  imageMotionStageIndex,
  monotonicProgress,
  monotonicStage,
  type ImageMotionStageIndex,
} from "@/src/lib/vilish/image-motion";
import { cn } from "@/lib/utils";

/**
 * ImageDevelopMotion — the "Developing your image" waiting-room experience.
 *
 * A live editorial darkroom motion piece (black / cream / muted antique
 * gold, restrained safelight red) that plays while an image generates.
 * Mirrors the video-edit page's motion architecture:
 *
 * REAL DATA ONLY:
 * - `progress` comes from progressForStage(stage, status) on the watch
 *   page — the honest backend pipeline position. It is clamped to 99 and
 *   made monotonic here, so the developer front eases forward in
 *   milestones and can never jump backwards or show 100% early.
 * - `stageText` is displayStage(data.stage) — the watcher's own words.
 * - The four motion stages (Preparing the darkroom → Developing the
 *   print → Fixing the print → Revealing your image) derive from that
 *   same real progress.
 *
 * The concept: a photographic print developing in a tray. The developer
 * front advances ONLY with real progress; the contact sheet frames gain
 * density as the pipeline passes their milestones. Ambient loops (grain,
 * dust, liquid shimmer) run from t=0 with negative delays so the handoff
 * into the idle loop is invisible. prefers-reduced-motion → calm static
 * scene.
 */

/** Which tray thumb is "worked on" per stage — editorial detail only. */
const SEL_BY_STAGE: Record<ImageMotionStageIndex, number> = { 0: 0, 1: 2, 2: 3, 3: 4 };

export default function ImageDevelopMotion({
  progress,
  status,
  stageText,
  caption,
  kicker,
}: {
  /** Real backend progress 0–100 (progressForStage). Never faked. */
  progress: number;
  /** Raw job status ("queued" | "generating" | …). */
  status: string;
  /** Polished stage copy (displayStage). */
  stageText: string;
  /** Rotating caption line. */
  caption: string;
  /** Tier line, e.g. "Free preview · AI-generated". */
  kicker: string;
}) {
  // Displayed progress: monotonic + clamped to 99 while processing.
  const [shown, setShown] = useState(() => clampProcessingProgress(progress));
  useEffect(() => {
    setShown((p) => monotonicProgress(p, progress));
  }, [progress]);

  // Motion stage: monotonic, derived from the same real progress.
  const [stage, setStage] = useState<ImageMotionStageIndex>(() =>
    imageMotionStageIndex(shown, status),
  );
  useEffect(() => {
    setStage((s) => monotonicStage(s, imageMotionStageIndex(shown, status)));
  }, [shown, status]);

  const selIdx = SEL_BY_STAGE[stage];
  // The developer front rides with the real progress position.
  const frontPct = shown;
  // Latent-image density follows real progress — the print "develops".
  const density = useMemo(() => 0.14 + (0.86 * shown) / 100, [shown]);

  return (
    <section className="idm" aria-label="Developing your image">
      {/* darkroom ambience */}
      <div className="idm-safelight" aria-hidden="true" />
      <div className="idm-grain" aria-hidden="true" />
      <div className="idm-dust idm-dust-a" aria-hidden="true" />
      <div className="idm-dust idm-dust-b" aria-hidden="true" />
      <div className="idm-dust idm-dust-c" aria-hidden="true" />

      <div className="idm-inner">
        <p className="idm-kicker">{kicker}</p>

        {/* contact sheet — frames develop as the pipeline advances */}
        <div className="idm-sheet" aria-hidden="true">
          <div className="idm-sprockets idm-sprockets-top">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          <div className="idm-frames">
            {CONTACT_SHEET_MILESTONES.map((milestone, i) => {
              const developed = shown >= milestone;
              return (
                <span
                  key={i}
                  className={cn(
                    "idm-frame",
                    `f${i}`,
                    developed && "is-developed",
                    i === selIdx && "is-sel",
                  )}
                  style={{ ["--d" as string]: `${i * 0.12}s` }}
                >
                  <span
                    className="idm-print"
                    style={{
                      opacity: developed ? density : 0.14,
                      filter: developed
                        ? `contrast(${0.7 + 0.5 * (shown / 100)})`
                        : "contrast(0.7)",
                    }}
                  />
                  <span className="idm-frame-num">{String(i + 1).padStart(2, "0")}</span>
                </span>
              );
            })}
          </div>
          <div className="idm-sprockets idm-sprockets-bottom">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
        </div>

        {/* developer tray — the print develops here */}
        <div
          className="idm-tray"
          role="progressbar"
          aria-label="Image development progress"
          aria-valuenow={shown}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="idm-liquid" aria-hidden="true">
            <span className="idm-shimmer" />
          </div>
          <div className={cn("idm-paper", stage >= 2 && "is-fixed")} aria-hidden="true">
            <span
              className="idm-paper-image"
              style={{
                opacity: density,
                filter: `contrast(${0.65 + 0.6 * (shown / 100)}) saturate(${0.6 + 0.5 * (shown / 100)})`,
              }}
            />
            <span className="idm-paper-halftone" />
            {/* the developer front: advances only with real progress */}
            <span className="idm-devfront" style={{ left: `${frontPct}%` }} />
            <span className="idm-paper-edge" />
          </div>
          <div className="idm-tongs" aria-hidden="true">
            <span className="idm-drip idm-drip-a" />
            <span className="idm-drip idm-drip-b" />
          </div>
        </div>

        {/* stage rail — real backend stage */}
        <div className="idm-rail" role="list" aria-label="Development stages">
          {IMAGE_MOTION_STAGES.map((label, i) => {
            const done = i < stage;
            const active = i === stage;
            return (
              <div
                key={label}
                role="listitem"
                aria-current={active ? "step" : undefined}
                className={cn("idm-stage", done && "is-done", active && "is-active")}
              >
                <span className="idm-node" aria-hidden="true">
                  {done ? (
                    <Check className="idm-check" strokeWidth={3} />
                  ) : (
                    <>
                      <span className="idm-dot" />
                      {active && <span className="idm-sweep" />}
                    </>
                  )}
                </span>
                <span className="idm-stage-label">{label}</span>
                <span className="idm-link" aria-hidden="true">
                  <span className="idm-link-fill" />
                </span>
              </div>
            );
          })}
          <div className="idm-pct" aria-hidden="true">
            {shown}%
          </div>
        </div>

        <p className="idm-status">
          <span className="idm-livedot" aria-hidden="true" />
          <span>{stageText}</span>
          {caption ? <span aria-hidden="true">· {caption}</span> : null}
        </p>
      </div>
    </section>
  );
}
