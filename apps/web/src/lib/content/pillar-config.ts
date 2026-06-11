/**
 * Pillar page definitions and cluster configuration
 * Ukrainian MAP / Aegis Lens — Content Strategy
 */

import type { ContentClusterId, PillarPage } from "./types";

export const PILLAR_PAGES: PillarPage[] = [
  {
    id: "pillar-osint-intro",
    title: {
      en: "What is OSINT?",
      uk: "Що таке OSINT?",
    },
    slug: "what-is-osint",
    wordCountTarget: 3000,
    cluster: "methodology",
    status: "draft",
    primaryKeyword: "what is OSINT",
  },
  {
    id: "pillar-verify-photo-video",
    title: {
      en: "How to verify a photo / video",
      uk: "Як верифікувати фото та відео",
    },
    slug: "how-to-verify-photo-video",
    wordCountTarget: 3500,
    cluster: "verification",
    status: "draft",
    primaryKeyword: "how to verify a photo video",
  },
  {
    id: "pillar-geolocation-guide",
    title: {
      en: "Geolocation OSINT — a complete guide",
      uk: "Геолокація через OSINT — повний посібник",
    },
    slug: "geolocation-osint-complete-guide",
    wordCountTarget: 4000,
    cluster: "geolocation",
    status: "draft",
    primaryKeyword: "geolocation OSINT guide",
  },
  {
    id: "pillar-ai-intelligence",
    title: {
      en: "AI for intelligence analysis — capabilities & limits",
      uk: "ШІ для аналізу розвідданих — можливості та обмеження",
    },
    slug: "ai-for-intelligence-analysis",
    wordCountTarget: 3000,
    cluster: "methodology",
    status: "draft",
    primaryKeyword: "AI for intelligence analysis",
  },
  {
    id: "pillar-conflict-monitoring",
    title: {
      en: "Conflict monitoring — sources & methods",
      uk: "Моніторинг конфліктів — джерела та методи",
    },
    slug: "conflict-monitoring-sources-methods",
    wordCountTarget: 3000,
    cluster: "methodology",
    status: "draft",
    primaryKeyword: "conflict monitoring sources methods",
  },
  {
    id: "pillar-satellite-imagery",
    title: {
      en: "Satellite imagery analysis explained",
      uk: "Аналіз супутникових знімків — пояснення",
    },
    slug: "satellite-imagery-analysis-explained",
    wordCountTarget: 3000,
    cluster: "equipment_id",
    status: "draft",
    primaryKeyword: "satellite imagery analysis OSINT",
  },
  {
    id: "pillar-disinfo-detection",
    title: {
      en: "Disinformation detection methods",
      uk: "Методи виявлення дезінформації",
    },
    slug: "disinformation-detection-methods",
    wordCountTarget: 3000,
    cluster: "verification",
    status: "draft",
    primaryKeyword: "disinformation detection methods",
  },
  {
    id: "pillar-threat-intel-vs-osint",
    title: {
      en: "Threat intelligence vs OSINT vs SIGINT",
      uk: "Threat intelligence vs OSINT vs SIGINT — порівняння",
    },
    slug: "threat-intelligence-vs-osint-vs-sigint",
    wordCountTarget: 3500,
    cluster: "methodology",
    status: "draft",
    primaryKeyword: "threat intelligence vs OSINT vs SIGINT",
  },
];

export const CONTENT_CLUSTERS: Record<
  ContentClusterId,
  {
    pillarId: string;
    targetPostCount: number;
    description: { en: string; uk: string };
  }
> = {
  verification: {
    pillarId: "pillar-verify-photo-video",
    targetPostCount: 20,
    description: {
      en: "Cluster covering photo/video verification, reverse image search, metadata analysis, and disinformation detection.",
      uk: "Кластер охоплює верифікацію фото/відео, зворотний пошук зображень, аналіз метаданих і виявлення дезінформації.",
    },
  },
  geolocation: {
    pillarId: "pillar-geolocation-guide",
    targetPostCount: 20,
    description: {
      en: "Cluster covering geolocation techniques: landmarks, shadows, terrain matching, and mapping tools.",
      uk: "Кластер охоплює техніки геолокації: орієнтири, тіні, зіставлення рельєфу та картографічні інструменти.",
    },
  },
  equipment_id: {
    pillarId: "pillar-satellite-imagery",
    targetPostCount: 15,
    description: {
      en: "Cluster covering equipment identification: military hardware, satellite imagery interpretation, and open-source imagery sources.",
      uk: "Кластер охоплює ідентифікацію техніки: військове обладнання, інтерпретацію супутникових знімків та відкриті джерела зображень.",
    },
  },
  country_region: {
    pillarId: "pillar-conflict-monitoring",
    targetPostCount: 30,
    description: {
      en: "Cluster covering regional intelligence: Ukraine, Black Sea, Middle East, and conflict zones worldwide.",
      uk: "Кластер охоплює регіональну розвідку: Україна, Чорне море, Близький Схід та зони конфліктів по всьому світу.",
    },
  },
  methodology: {
    pillarId: "pillar-osint-intro",
    targetPostCount: 25,
    description: {
      en: "Cluster covering OSINT methodology, analytical frameworks, tooling, and tradecraft for intelligence professionals.",
      uk: "Кластер охоплює методологію OSINT, аналітичні фреймворки, інструментарій і спеціальні прийоми для фахівців з розвідки.",
    },
  },
};
