import { MissileModel, MissileSubtype, TargetType, MissileLaunchPlatform, MissileEventSubstatus } from "./types";

const MODEL_PATTERNS: Array<{ keywords: string[]; model: MissileModel; confidence: number }> = [
  { keywords: ["iskander-m", "іскандер-м", "9k720"], model: "iskander_m", confidence: 0.9 },
  { keywords: ["iskander-k", "іскандер-к"], model: "iskander_k", confidence: 0.88 },
  { keywords: ["kalibr", "каліьбр", "3m14", "3м14"], model: "kalibr", confidence: 0.9 },
  { keywords: ["kh-101", "х-101", "x-101"], model: "kh_101", confidence: 0.9 },
  { keywords: ["kh-55", "х-55", "x-55"], model: "kh_55", confidence: 0.88 },
  { keywords: ["kh-22", "х-22", "x-22", "kitchen"], model: "kh_22", confidence: 0.88 },
  { keywords: ["kinzhal", "кинджал", "кинжал", "kh-47", "х-47"], model: "kh_47_kinzhal", confidence: 0.92 },
  { keywords: ["kh-31", "х-31", "x-31"], model: "kh_31p", confidence: 0.85 },
  { keywords: ["tochka", "точка-у", "tochka-u", "ss-21"], model: "tochka_u", confidence: 0.88 },
  { keywords: ["s-300", "s300", "с-300"], model: "s_300_surface", confidence: 0.8 },
  { keywords: ["himars", "hімарс", "m31", "гімарс"], model: "himars_m31", confidence: 0.85 },
  { keywords: ["atacms", "атакмс"], model: "himars_atacms", confidence: 0.9 },
  { keywords: ["storm shadow", "storm-shadow", "сторм шедоу"], model: "storm_shadow", confidence: 0.92 },
  { keywords: ["scalp", "scalp-eg", "скальп"], model: "scalp_eg", confidence: 0.9 },
  { keywords: ["amraam", "aim-120"], model: "aim_120_amraam", confidence: 0.88 },
  { keywords: ["harm", "agm-88", "harm missile"], model: "harm_agm88", confidence: 0.9 },
];

const SUBTYPE_PATTERNS: Array<{ keywords: string[]; subtype: MissileSubtype }> = [
  { keywords: ["ballistic", "балістич"], subtype: "ballistic" },
  { keywords: ["cruise", "крилата ракета", "крилат"], subtype: "cruise" },
  { keywords: ["hypersonic", "гіперзвук", "kinzhal", "кинджал"], subtype: "hypersonic" },
  { keywords: ["air-launched", "авіаційна ракета", "air launched"], subtype: "air_launched" },
  { keywords: ["atgm", "птур", "протитанков"], subtype: "atgm" },
  { keywords: ["mlrs", "рсзо", "grad", "smerch", "uragan", "рс-"], subtype: "mlrs" },
  { keywords: ["anti-radiation", "harm", "протирадіолокаційна"], subtype: "anti_radiation" },
];

const TARGET_PATTERNS: Array<{ keywords: string[]; target: TargetType }> = [
  { keywords: ["energy", "power plant", "thermal", "субстанція", "підстанція", "теплова", "електро"], target: "energy_infrastructure" },
  { keywords: ["military base", "military installation", "барак", "база"], target: "military_base" },
  { keywords: ["industrial", "завод", "завод", "factory"], target: "industrial" },
  { keywords: ["residential", "житловий", "apartment", "будинок", "будинок"], target: "residential" },
  { keywords: ["railway", "train station", "вокзал", "залізниця", "transport"], target: "transport_hub" },
  { keywords: ["command", "headquarters", "командний"], target: "command_control" },
  { keywords: ["air defense", "ппо", "radar", "радар"], target: "air_defense" },
];

const SUBSTATUS_PATTERNS: Array<{ keywords: string[]; substatus: MissileEventSubstatus }> = [
  { keywords: ["launched", "запущено", "fired", "відкрито вогонь"], substatus: "launched" },
  { keywords: ["in flight", "in-flight", "летить", "tracked"], substatus: "in_flight" },
  { keywords: ["intercepted", "shot down", "збито", "перехоплено"], substatus: "intercepted" },
  { keywords: ["impact", "hit", "strike", "поцілила", "удар", "влучила"], substatus: "impact" },
];

export function classifyModel(text: string) {
  const lower = text.toLowerCase();
  for (const { keywords, model, confidence } of MODEL_PATTERNS) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return { value: model, confidence, sourceCount: 1 };
    }
  }
  return undefined;
}

export function classifySubtype(text: string): MissileSubtype {
  const lower = text.toLowerCase();
  for (const { keywords, subtype } of SUBTYPE_PATTERNS) {
    if (keywords.some((kw) => lower.includes(kw))) return subtype;
  }
  return "cruise"; // most common default
}

export function classifyTarget(text: string) {
  const lower = text.toLowerCase();
  for (const { keywords, target } of TARGET_PATTERNS) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return { value: target, confidence: 0.7 };
    }
  }
  return undefined;
}

export function classifySubstatus(text: string): MissileEventSubstatus {
  const lower = text.toLowerCase();
  for (const { keywords, substatus } of SUBSTATUS_PATTERNS) {
    if (keywords.some((kw) => lower.includes(kw))) return substatus;
  }
  return "unconfirmed";
}

export function deriveSeverity(
  subtype: MissileSubtype,
  substatus: MissileEventSubstatus,
  model?: string,
): 1 | 2 | 3 | 4 | 5 {
  if (substatus === "intercepted") return 2;
  if (subtype === "hypersonic") return 5;
  if (model === "kh_47_kinzhal") return 5;
  if (subtype === "ballistic") return 5;
  if (substatus === "impact") return 5;
  if (subtype === "mlrs") return 4;
  if (subtype === "cruise") return 4;
  return 3;
}
