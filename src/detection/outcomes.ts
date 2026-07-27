/**
 * Detection Result outcomes (Domain Model §6.2).
 * Prefer NotDetected for FlexyPe product insufficient confidence (FR-013).
 */
export const DetectionOutcome = {
  Detected: "Detected",
  NotDetected: "NotDetected",
  Disabled: "Disabled",
  Unknown: "Unknown",
  NotApplicable: "NotApplicable",
  Available: "Available",
  Unavailable: "Unavailable",
} as const;

export type DetectionOutcome = (typeof DetectionOutcome)[keyof typeof DetectionOutcome];

export const DETECTION_OUTCOMES: readonly DetectionOutcome[] =
  Object.values(DetectionOutcome);

/**
 * Non-mandated placeholder for typing honesty only.
 * Must not be used as the FlexyPe product insufficient-confidence outcome.
 */
export const AbsentNote = {
  Absent: "Absent",
  NotPresent: "NotPresent",
} as const;

export type AbsentNote = (typeof AbsentNote)[keyof typeof AbsentNote];

export const ThemeAvailability = {
  Available: "Available",
  Unavailable: "Unavailable",
} as const;

export type ThemeAvailability =
  (typeof ThemeAvailability)[keyof typeof ThemeAvailability];

export const DisabledIntegrationState = {
  Live: "Live",
  Disabled: "Disabled",
  Unknown: "Unknown",
} as const;

export type DisabledIntegrationState =
  (typeof DisabledIntegrationState)[keyof typeof DisabledIntegrationState];

export function isDetectionOutcome(value: string): value is DetectionOutcome {
  return (DETECTION_OUTCOMES as readonly string[]).includes(value);
}
