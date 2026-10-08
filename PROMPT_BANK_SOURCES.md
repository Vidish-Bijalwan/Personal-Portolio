# Prompt Bank Sources — Etch cinema-grade prompt bank

Built 2026-10-08 by CODER 3 (CINEMA-GRADE PROMPT BANK). Every source below
is a real public URL that was actually fetched during research. The bank
uses only short, factual prompt fragments / vocabulary terms (lighting,
lens, film-stock, composition, quality, negative terms) — no source text
was reproduced wholesale, no artwork copied. Each term module also carries
its own `*_SOURCES` attribution list.

## Sources

| # | Source | URL | License | What the bank took from it |
|---|--------|-----|---------|----------------------------|
| 1 | belentani7/cinematic-prompt-formatter | https://github.com/belentani7/cinematic-prompt-formatter | MIT (confirmed on repo page) | Lens Types, Lighting, Camera Movement, Mood/Atmosphere, Color Grading, Presets — cinema styles, lighting, lens vocabulary |
| 2 | "Collection of useful Stable Diffusion prompt modifiers" (thesephist gist) | https://gist.github.com/thesephist/376afed2cbfce35d4b37d985abe6d0a1 | Public gist (no license stated) | Lighting, Angle & framing, Lens & Capture, Film selection, Art style, Vibes, Mood, Scale — lighting/framing/film/quality fragments |
| 3 | willwulfken/MidJourney-Styles-and-Keywords-Reference (via fork kalelqs/midjourney-styles-and-keywords-reference) | https://github.com/kalelqs/midjourney-styles-and-keywords-reference (fork of https://github.com/willwulfken/MidJourney-Styles-and-Keywords-Reference) | No LICENSE file in repo; upstream CC-style attribution applies — short factual keywords only, attributed | Style Pages/Lighting.md + Style Pages/Camera.md raw keyword lists — lighting types, film stocks (Kodak Portra/Ektar, Fujifilm Velvia, Ilford HP5…), lenses, perspectives, camera settings |
| 4 | realaman90/ai-film-skills — nano-banana.md | https://github.com/realaman90/ai-film-skills/blob/HEAD/reference/nano-banana.md | No license file confirmed on fetched page — short fragments only, attributed | Composition table (rule of thirds, leading lines, negative space…), Camera & Shot Types, "Design your lighting", color grading, Quality Keywords |
| 5 | jr-mccoy/prompt-agent-engineering — IMAGE_PROMPTING_GUIDE.md | https://github.com/jr-mccoy/prompt-agent-engineering/blob/HEAD/domain-image-generation/IMAGE_PROMPTING_GUIDE.md | No license file confirmed on fetched page — short fragments only, attributed | Composition Rules (rule of thirds, leading lines, frame within frame, negative space, golden ratio) |
| 6 | yuri-schmaltz/my-directors-console — CinemaPromptEngineering/Documentation/AI_MODEL_PROMPTING.md | https://github.com/yuri-schmaltz/my-directors-console (repo page fetched; doc path via search excerpt) | No license file confirmed on fetched page — short fragments only, attributed | SDXL prompt structure, Quality/Camera/Lens/Film/Lighting token tables, Negative Prompts list (SDXL + cinematic-specific) |
| 7 | avaray/dav.one — "Mastering realistic photography using Stable Diffusion XL" | https://github.com/avaray/dav.one/blob/HEAD/src/articles/mastering-realistic-photography-using-stable-diffusion-xl/index.mdx | Public repo; article text not reproduced — short fragments only, attributed | Positive-prompt guidance (photography terminology, lighting, camera/film keywords), Negative-prompt guidance (low quality, watermark, text, artifacts…) |

Notes:
- Trademarked product names (Kodak Portra, Cinestill 800T, Fujifilm Velvia,
  Ilford HP5, ARRI Alexa, IMAX) appear only as factual industry terms.
- Fragment wording in the bank is original phrasing of these standard
  terms; no source's sentences were copied.

## Bank structure (`src/data/prompt-bank/`)

```
src/data/prompt-bank/
├── types.ts             # BankTerm, CinemaStyle, EnhanceOptions, EnhanceResult
├── cinema-styles.ts     # 16 cinema style presets (noir, cyberpunk, western,
│                        #   epic, indie, horror, romance, documentary, vintage,
│                        #   anime [illustrative], editorial, commercial, fantasy,
│                        #   thriller, surreal, steampunk) + DEFAULT_CINEMA_FRAGMENTS
├── lighting.ts          # 22 lighting terms (golden hour, chiaroscuro, rim,
│                        #   volumetric, Rembrandt, neon, practical…) + default
├── lenses.ts            # 9 lens terms (anamorphic, 85mm, 35mm, macro…),
│                        #   8 film-stock terms (Portra 400, Cinestill 800T,
│                        #   Vision3 500T, Velvia, Ektar, HP5, Kodachrome, grain),
│                        #   5 camera/depth terms (ARRI Alexa, IMAX 70mm,
│                        #   medium format, shallow DOF, deep focus)
├── composition.ts       # 14 composition terms (rule of thirds, leading lines,
│                        #   symmetry, negative space, golden ratio, frame within
│                        #   frame, dutch angle, low/high angle, aerial,
│                        #   depth layering…) + default
├── quality-suffixes.ts  # 8 quality terms (ultra-detailed, sharp focus,
│                        #   high resolution, color grading…) + CORE_QUALITY_TERMS
├── negative-prompts.ts  # NEGATIVE_QUALITY (22 defect/artifact terms) +
│                        #   NEGATIVE_MEDIA (6 medium terms, withheld for
│                        #   illustrative styles) + DEFAULT_NEGATIVE_PROMPT
├── builder.ts           # enhancePrompt(raw, opts) — deterministic, additive
└── __tests__/builder.test.ts  # 22 tests (see below)
```

### `enhancePrompt(raw, opts)` — assembly order

```
<user's words VERBATIM>, <cinema style fragments>, <lighting>, <optics>,
<composition>, <quality>
```

### Hard rules (also enforced by tests)

1. The user's words are preserved verbatim and ALWAYS lead the prompt.
2. Bank fragments are only APPENDED — never interleaved, never rewritten.
3. Dedup: a fragment (or any of its aliases, e.g. "rim light" vs
   "rim lighting") is skipped when the user already wrote it. The caller
   can also pass `context` (text prepended outside the builder, e.g. the
   style/genre prefix in `interpretCreative`) for dedup.
4. No contradiction: photographic boosters and photographic media negatives
   (cartoon/illustration/anime/painting/drawing/3d render) are withheld when
   an illustrative style (anime) is detected.
5. `maxLength` trims bank fragments from the tail only — the user's words
   are never truncated.
6. Deterministic: same input → same output. No randomness, no network.

### Wire-in points

| Path | Change |
|------|--------|
| `src/lib/creative/interpret.ts` | `interpretCreative` now builds `enhancedPrompt` via `enhancePrompt()` (replacing the old fixed ", high detail, professional composition, balanced lighting" suffix) and sets `spec.negativePrompt` from the bank. Feeds /create image generations via /api/creative/interpret → quote → job → worker → provider. |
| `src/lib/ads/concepts.ts` | `buildFinalPrompt()` applies `enhancePrompt()` to the assembled ad prompt (used by the /ads live preview and the /create deep-link; dedup keeps the second interpretation from stacking terms). |
| `app/api/video/order/route.ts` | Video orders store `enhancePrompt(..., { media: 'video' })` so the operator prompt carries the cinema foundation too. |

### Test coverage

- `src/data/prompt-bank/__tests__/builder.test.ts` (22 tests): verbatim-lead,
  bank application, style/lighting/optics/composition matching, all dedup
  cases, negative prompts (incl. illustrative-style withholding + override),
  maxLength behavior, empty input, determinism, and integration checks on
  both wired call sites (/create via interpretCreative, /ads via
  buildFinalPrompt, double-application no-stacking).
- Updated `src/lib/creative/__tests__/interpret.test.ts` and
  `src/lib/ads/__tests__/concepts.test.ts` to the new enhancement behavior.

## Example before / after

Before (user prompt):
> `a fox in snow`

After (`interpretCreative` enhancedPrompt):
> `a fox in snow, cinematic film still, professional color grading, balanced cinematic lighting, professional composition, ultra-detailed, sharp focus`

Negative prompt set automatically:
> `low quality, lowres, blurry, out of focus, bad anatomy, deformed, distorted, disfigured, extra limbs, missing fingers, mutated hands, grainy, noisy, jpeg artifacts, pixelated, watermark, signature, text overlay, oversaturated, overexposed, underexposed, amateur, cartoon, illustration, anime, painting, drawing, 3d render`

Style match example — user: `noir detective in a rainy alley`:
> `noir detective in a rainy alley, film noir, high-contrast black and white, deep shadows, balanced cinematic lighting, professional composition, ultra-detailed, sharp focus`
