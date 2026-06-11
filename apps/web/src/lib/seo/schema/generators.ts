/**
 * Per-template schema.org generators (typed, pure).
 *
 * Sprint 0 shipped `organizationJsonLd` / `websiteJsonLd` in `lib/seo.ts` and
 * left the rest inlined per page. This module EXTENDS — it re-exports the two
 * existing generators unchanged and adds typed, pure generators for the other
 * templates in TODO_schema_library.md, so the CI test and the audit have one
 * importable surface to validate.
 *
 * These mirror the exact shapes pages already emit inline (verified by grep);
 * adopting them does not change crawler-visible output. They are deliberately
 * dependency-free (no React, no network) and accept already-built absolute URLs
 * so locale prefixes are decided by the caller's `urls.*`/`absoluteUrl`.
 */

import { organizationJsonLd, websiteJsonLd } from "../../seo";
import {
  breadcrumbListJsonLd,
  type BreadcrumbListJsonLd,
} from "../breadcrumbs/render-rules";

export { organizationJsonLd, websiteJsonLd, breadcrumbListJsonLd };
export type { BreadcrumbListJsonLd };

const CTX = "https://schema.org" as const;

export interface ArticleInput {
  headline: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  description?: string;
  image?: string;
  authorName: string;
  publisherName: string;
  publisherUrl: string;
  inLanguage: string;
}

export function articleJsonLd(a: ArticleInput) {
  return {
    "@type": "Article",
    headline: a.headline,
    url: a.url,
    mainEntityOfPage: a.url,
    datePublished: a.datePublished,
    dateModified: a.dateModified ?? a.datePublished,
    description: a.description,
    image: a.image,
    inLanguage: a.inLanguage,
    author: { "@type": "Person", name: a.authorName },
    publisher: { "@type": "Organization", name: a.publisherName, url: a.publisherUrl },
  };
}

export function newsArticleJsonLd(a: ArticleInput) {
  return { ...articleJsonLd(a), "@type": "NewsArticle" };
}

export function techArticleJsonLd(a: ArticleInput) {
  return { ...articleJsonLd(a), "@type": "TechArticle" };
}

export interface FaqItem {
  q: string;
  a: string;
}

export function faqPageJsonLd(items: FaqItem[], inLanguage?: string) {
  return {
    "@type": "FAQPage",
    ...(inLanguage ? { inLanguage } : {}),
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export interface HowToStepInput {
  name: string;
  text: string;
  url?: string;
}

export function howToJsonLd(name: string, steps: HowToStepInput[], description?: string) {
  return {
    "@type": "HowTo",
    name,
    description,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      url: s.url,
    })),
  };
}

export interface EventInput {
  name: string;
  startDate: string;
  endDate?: string;
  placeName: string;
  lat?: number;
  lon?: number;
  description?: string;
  url?: string;
}

export function eventJsonLd(e: EventInput) {
  return {
    "@type": "Event",
    name: e.name,
    startDate: e.startDate,
    endDate: e.endDate,
    description: e.description,
    url: e.url,
    location: {
      "@type": "Place",
      name: e.placeName,
      ...(e.lat != null && e.lon != null
        ? { geo: { "@type": "GeoCoordinates", latitude: e.lat, longitude: e.lon } }
        : {}),
    },
  };
}

export function placeJsonLd(name: string, lat?: number, lon?: number) {
  return {
    "@type": "Place",
    name,
    ...(lat != null && lon != null
      ? { geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lon } }
      : {}),
  };
}

export function productJsonLd(name: string, description?: string, image?: string) {
  return { "@type": "Product", name, description, image };
}

export interface PersonInput {
  name: string;
  url?: string;
  jobTitle?: string;
  sameAs?: string[];
}

export function personJsonLd(p: PersonInput) {
  return {
    "@type": "Person",
    name: p.name,
    url: p.url,
    jobTitle: p.jobTitle,
    sameAs: p.sameAs,
  };
}

export interface DatasetInput {
  name: string;
  description: string;
  url?: string;
  license?: string;
  creatorName?: string;
}

export function datasetJsonLd(d: DatasetInput) {
  return {
    "@type": "Dataset",
    name: d.name,
    description: d.description,
    url: d.url,
    license: d.license,
    ...(d.creatorName ? { creator: { "@type": "Organization", name: d.creatorName } } : {}),
  };
}

export function definedTermJsonLd(name: string, description?: string, inDefinedTermSet?: string) {
  return { "@type": "DefinedTerm", name, description, inDefinedTermSet };
}

export function definedTermSetJsonLd(name: string, description?: string) {
  return { "@type": "DefinedTermSet", name, description };
}

export interface CourseInput {
  name: string;
  description: string;
  providerName: string;
  providerUrl: string;
  url?: string;
  inLanguage?: string;
}

export function courseJsonLd(c: CourseInput) {
  return {
    "@type": "Course",
    name: c.name,
    description: c.description,
    url: c.url,
    inLanguage: c.inLanguage,
    provider: { "@type": "Organization", name: c.providerName, url: c.providerUrl },
  };
}

export function learningResourceJsonLd(name: string, url?: string, inLanguage?: string) {
  return { "@type": "LearningResource", name, url, inLanguage };
}

export interface VideoInput {
  name: string;
  thumbnailUrl: string;
  uploadDate: string;
  description?: string;
  contentUrl?: string;
  duration?: string;
}

export function videoObjectJsonLd(v: VideoInput) {
  return {
    "@type": "VideoObject",
    name: v.name,
    thumbnailUrl: v.thumbnailUrl,
    uploadDate: v.uploadDate,
    description: v.description,
    contentUrl: v.contentUrl,
    duration: v.duration,
  };
}

export function podcastSeriesJsonLd(name: string, url?: string, description?: string) {
  return { "@type": "PodcastSeries", name, url, description };
}

export function podcastEpisodeJsonLd(name: string, url?: string, partOfSeries?: string) {
  return {
    "@type": "PodcastEpisode",
    name,
    url,
    ...(partOfSeries ? { partOfSeries: { "@type": "PodcastSeries", name: partOfSeries } } : {}),
  };
}

export function softwareApplicationJsonLd(name: string, category?: string, url?: string) {
  return { "@type": "SoftwareApplication", name, applicationCategory: category, url };
}

export function serviceJsonLd(name: string, description?: string) {
  return { "@type": "Service", name, description };
}

export interface ItemListEntry {
  name: string;
  url: string;
}

export function itemListJsonLd(entries: ItemListEntry[]) {
  return {
    "@type": "ItemList",
    itemListElement: entries.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.name,
      item: e.url,
    })),
  };
}

export function collectionPageJsonLd(name: string, url: string, description?: string, inLanguage?: string) {
  return {
    "@type": "CollectionPage",
    name,
    url,
    description,
    inLanguage,
  };
}

export function webPageJsonLd(name: string, url: string, inLanguage?: string) {
  return { "@type": "WebPage", name, url, inLanguage };
}

/**
 * Wrap one or more nodes into a `@graph` document with the schema.org context.
 * Mirrors the page inline shape `{ "@context", "@graph": [...] }`.
 */
export function graph(...nodes: object[]) {
  return { "@context": CTX, "@graph": nodes };
}
