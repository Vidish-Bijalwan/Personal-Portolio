/**
 * Madam Muse — shared creative-brief types.
 * CONTRACT (CONTRACTS.md §1): implement these shapes EXACTLY. Do not rename.
 * Created by the compiler workstream; consumed by UI + backend workstreams.
 */

export type RefRole =
  | 'style'
  | 'composition'
  | 'palette'
  | 'typography'
  | 'texture'
  | 'mood'
  | 'subject';

export type TaskType =
  | 'image-generate'
  | 'image-edit'
  | 'video-edit'
  | 'video-generate';

export interface AssetMeta {
  kind: 'image' | 'video';
  name: string;
  mime: string;
  width: number; // px, 0 if unknown
  height: number; // px, 0 if unknown
  sizeBytes: number;
  durationSec?: number; // video only
}

export interface RefMeta extends AssetMeta {
  id: string; // client-generated, e.g. 'ref_01'
  role: RefRole; // auto-detected, user-overridable
  roleConfidence: number; // 0..1
  roleUserOverride: boolean;
  palette?: string[]; // hex colors, when role includes palette
}

export interface CreativeBrief {
  version: 1;
  taskType: TaskType;
  instruction: string;
  primary: AssetMeta | null; // null => pure generation from text
  references: RefMeta[];
  preserve: string[]; // e.g. ['face','product','logo','text','geometry','background']
  modifiers: string[]; // parsed user modifiers, e.g. ['darker','more grain']
  exclusions: string[]; // anti-generic + user exclusions
  visualFamily?: string; // image: one of the 15 playbook families
  outputSpec: {
    media: 'image' | 'video';
    aspectRatio: '1:1' | '4:5' | '9:16' | '16:9';
    quality: 'quick' | 'studio' | 'cinema';
    durationSec?: number; // video only
  };
  storyPlan?: {
    // video-edit only
    structure: 'hook-cta' | 'problem-proof-cta';
    beats: string[];
    pacingNotes: string;
    musicNotes: string;
    captionNotes: string;
    colorNotes: string;
  };
}
