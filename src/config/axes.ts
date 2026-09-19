import aiAxes from './generated/axes_ai';
import humanAxes from './generated/axes_human';

export const AI_AXES = ["smd","itq","agg","cycle_velocity","verification","hexad","geopolitics"] as const;

export const HUMAN_AXES = ["h1_agency","h2_sovereignty","h3_wellbeing","h4_equity","h5_meaning","h6_democracy"] as const;

// Экспорт полной конфигурации осей
export const AI_AXES_CONFIG = aiAxes;
export const HUMAN_AXES_CONFIG = humanAxes;

// SMD thresholds based on Anthropic R&D Automation Index (Sep 2026)
export const SMD_THRESHOLD = {
  L4_MIN_SYSTEMS: 2,
  L4_CURRENT_SYSTEMS: 1,
  ANTHROPIC_AL4_PERCENT: 26,
  ANTHROPIC_AL3_PERCENT: 90,
  LEVEL: 0.45,
} as const;
