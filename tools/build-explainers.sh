#!/usr/bin/env bash
# WS1 — build 8s explainer MP4s from AI keyframe stills.
# slow zoom on still A (input) -> crossfade -> slow zoom-out on still B (result),
# with 3 timed step overlays burned in. Output: 960x540 h264 yuv420p faststart, <=2MB.
set -euo pipefail

WORKDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STILLS="$WORKDIR/.explainer-stills"
OUT="$WORKDIR/public/tools/explainers"
STEPS_TMP="$(mktemp -d)"
FONT="/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf"
mkdir -p "$OUT"

# Honest step copy per tool (from src/lib/tools/details.ts — no invented capabilities).
# Format: id|s1|s2|s3
readarray -t ROWS <<'EOF'
single-image|1 · Describe what you want|2 · We generate it, a human reviews it|3 · Pay once, download the HD image
pack-4|1 · Write one brief|2 · Four takes on your idea|3 · Pay once, keep your favourite
product-photo|1 · Send a photo of your product|2 · Pick your scene|3 · Download your listing-ready shot
clip-5s|1 · Describe the scene and motion|2 · We generate your 5-second clip|3 · Pay once, post it anywhere
tts|1 · Upload your video|2 · Paste your script, pick a voice|3 · Get the narrated cut
caption|1 · Upload your video|2 · Paste your script|3 · Styled captions burned in
trim|1 · Upload and mark your cut|2 · Add a title (optional)|3 · Download the clean cut
compress|1 · Upload the video that is too big|2 · Pick Small, Balanced or Best|3 · Download the smaller file
convert|1 · Upload your MP4|2 · We pull out the audio|3 · Download the MP3
gif|1 · Upload and mark up to 10 seconds|2 · We tune the palette and frames|3 · Download your GIF
add-audio|1 · Upload video plus your track|2 · Mix under, or replace the audio|3 · Download the finished cut
denoise|1 · Upload the noisy video|2 · Pick Light, Medium or Strong|3 · Download the cleaner cut
EOF

for row in "${ROWS[@]}"; do
  IFS='|' read -r id s1 s2 s3 <<< "$row"
  A="$STILLS/${id}-a.jpg"; B="$STILLS/${id}-b.jpg"
  if [[ ! -f "$A" || ! -f "$B" ]]; then echo "SKIP $id (missing stills)"; continue; fi
  printf '%s' "$s1" > "$STEPS_TMP/$id-1.txt"
  printf '%s' "$s2" > "$STEPS_TMP/$id-2.txt"
  printf '%s' "$s3" > "$STEPS_TMP/$id-3.txt"

  DRAWTEXT="drawtext=fontfile=${FONT}:textfile=${STEPS_TMP}/${id}-1.txt:fontsize=34:fontcolor=#F5F5F3:box=1:boxcolor=0x000000@0.55:boxborderw=22:x=48:y=h-118:enable='between(t,0,3.6)',drawtext=fontfile=${FONT}:textfile=${STEPS_TMP}/${id}-2.txt:fontsize=34:fontcolor=#F5F5F3:box=1:boxcolor=0x000000@0.55:boxborderw=22:x=48:y=h-118:enable='between(t,3.6,5.9)',drawtext=fontfile=${FONT}:textfile=${STEPS_TMP}/${id}-3.txt:fontsize=34:fontcolor=#F5F5F3:box=1:boxcolor=0x000000@0.55:boxborderw=22:x=48:y=h-118:enable='between(t,5.9,8.2)'"

  ffmpeg -y -v error \
    -loop 1 -framerate 30 -i "$A" \
    -loop 1 -framerate 30 -i "$B" \
    -filter_complex "\
[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='1+0.10*on/135':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=135:s=960x540:fps=30,setsar=1[a];\
[1:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,zoompan=z='1.10-0.10*on/135':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=135:s=960x540:fps=30,setsar=1[b];\
[a][b]xfade=transition=fade:duration=1:offset=3.5,scale=out_range=limited,format=yuv420p[v0];\
[v0]${DRAWTEXT}[v]" \
    -map "[v]" -c:v libx264 -preset medium -crf 24 -pix_fmt yuv420p \
    -movflags +faststart -an -t 8 "$OUT/${id}.mp4"

  # poster = frame near start of step 1
  ffmpeg -y -v error -ss 0.8 -i "$OUT/${id}.mp4" -frames:v 1 -q:v 4 "$OUT/${id}-poster.jpg"

  sz=$(stat -c%s "$OUT/${id}.mp4")
  printf '%-14s %8d bytes  %s\n' "$id" "$sz" "$([ "$sz" -le 2097152 ] && echo OK || echo TOO_BIG)"
done

rm -rf "$STEPS_TMP"
echo "--- final ---"
ls -la "$OUT"
