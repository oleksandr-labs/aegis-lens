/**
 * Sound design specification for Aegis Lens.
 * Audio is always paired with visual cues — never the sole notification channel.
 */

export type SoundEventType =
  | "event-arrival"
  | "alert-low"
  | "alert-medium"
  | "alert-high"
  | "alert-critical"
  | "success-save"
  | "error-failure"
  | "copilot-turn-end"
  | "brand-ident";

export interface SoundSpec {
  id: SoundEventType;
  name_en: string;
  durationMs: number;
  frequencyHz?: number;
  description_en: string;
  isDefault: boolean;
  pairedWithVisual: boolean;
  visualCueNote_en: string;
}

export const SOUND_SPECS: SoundSpec[] = [
  {
    id: "event-arrival",
    name_en: "Event Arrival Tick",
    durationMs: 120,
    frequencyHz: 880,
    description_en:
      "Soft, brief tick indicating a new event has landed on the map. Low-profile — should not distract.",
    isDefault: false,
    pairedWithVisual: true,
    visualCueNote_en: "Map marker pulse animation on new event pin",
  },
  {
    id: "alert-low",
    name_en: "Alert — Low Severity",
    durationMs: 200,
    frequencyHz: 660,
    description_en:
      "Gentle two-note tone for low-severity alerts. Distinct from event-arrival but not intrusive.",
    isDefault: false,
    pairedWithVisual: true,
    visualCueNote_en: "Alert badge appears with yellow indicator",
  },
  {
    id: "alert-medium",
    name_en: "Alert — Medium Severity",
    durationMs: 300,
    frequencyHz: 740,
    description_en:
      "Ascending two-tone chime for medium-severity alerts. Noticeably different timbre from low.",
    isDefault: false,
    pairedWithVisual: true,
    visualCueNote_en: "Alert banner slides in with orange indicator",
  },
  {
    id: "alert-high",
    name_en: "Alert — High Severity",
    durationMs: 400,
    frequencyHz: 820,
    description_en:
      "Three-note descending tone with richer timbre for high-severity alerts. Clearly urgent.",
    isDefault: false,
    pairedWithVisual: true,
    visualCueNote_en: "Alert modal appears with red border and shake animation",
  },
  {
    id: "alert-critical",
    name_en: "Alert — Critical",
    durationMs: 600,
    frequencyHz: 1000,
    description_en:
      "Single unmistakable tone for critical alerts only. Never overused — reserved for life-safety events.",
    isDefault: true,
    pairedWithVisual: true,
    visualCueNote_en: "Full-screen critical alert overlay with pulsing red border",
  },
  {
    id: "success-save",
    name_en: "Success / Save Chime",
    durationMs: 250,
    frequencyHz: 1047,
    description_en:
      "Bright, brief chime confirming a successful save, export, or completion action.",
    isDefault: false,
    pairedWithVisual: true,
    visualCueNote_en: "Green checkmark toast notification",
  },
  {
    id: "error-failure",
    name_en: "Error / Failure Tone",
    durationMs: 350,
    frequencyHz: 220,
    description_en:
      "Low-register tone indicating an error or failed action. Not alarming — informative.",
    isDefault: false,
    pairedWithVisual: true,
    visualCueNote_en: "Red error toast or inline field error state",
  },
  {
    id: "copilot-turn-end",
    name_en: "AI Copilot Turn End",
    durationMs: 180,
    frequencyHz: 523,
    description_en:
      "Soft two-note notification that the AI copilot has finished generating a response.",
    isDefault: false,
    pairedWithVisual: true,
    visualCueNote_en: "Copilot response card fades in; typing indicator stops",
  },
  {
    id: "brand-ident",
    name_en: "Brand Sonic Identity",
    durationMs: 1200,
    description_en:
      "3-note brand sound played on app open and report exports. Represents the Aegis Lens identity — premium, precise, restrained.",
    isDefault: false,
    pairedWithVisual: true,
    visualCueNote_en: "Logo animation on splash screen or export header",
  },
];

export const SOUND_DEFAULTS: {
  masterEnabled: boolean;
  masterVolume: number;
  perEventEnabled: Partial<Record<SoundEventType, boolean>>;
} = {
  masterEnabled: false,
  masterVolume: 0.7,
  perEventEnabled: {
    "alert-critical": true, // Only critical alerts are on by default
    "event-arrival": false,
    "alert-low": false,
    "alert-medium": false,
    "alert-high": false,
    "success-save": false,
    "error-failure": false,
    "copilot-turn-end": false,
    "brand-ident": false,
  },
};

export interface UserSoundPreferences {
  masterEnabled: boolean;
  masterVolume: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:MM 24h format
  quietHoursEnd: string;   // HH:MM 24h format
  perEventOverrides: Partial<Record<SoundEventType, boolean>>;
}

export const AUDIO_SPEC: {
  deliveryFormat: "webm" | "mp3" | "ogg";
  compression: string;
  lufsTarget: number;
  sampleRateHz: number;
  maxDurationMs: number;
  headphonesOptimized: boolean;
} = {
  deliveryFormat: "webm",
  compression: "Opus @ 64kbps for webm; MP3 128kbps fallback",
  lufsTarget: -14,
  sampleRateHz: 44100,
  maxDurationMs: 2000,
  headphonesOptimized: true,
};

export const SONIC_IDENTITY: {
  brandNotes: number[];
  frequencyProfile: string;
  character_en: string;
  engagementNote_en: string;
} = {
  brandNotes: [523, 659, 784], // C5 → E5 → G5 (major triad — stable, open)
  frequencyProfile: "Mid-range sinusoidal with slight reverb tail; no harsh transients",
  character_en: "Premium, precise, restrained — intelligence rather than action-game energy",
  engagementNote_en:
    "Played at app open and on report exports. Should feel like a signature, not a jingle.",
};

export const REDUCED_MOTION_AUDIO_POLICY: {
  respectsPrefersReducedMotion: boolean;
  audioNotASubstituteForVisual: boolean;
} = {
  respectsPrefersReducedMotion: true,
  audioNotASubstituteForVisual: true,
};
