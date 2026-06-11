import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import {
  COURSES,
  getCourse,
  LESSON_TYPE_ICON,
  LEVEL_LABEL,
} from "@/lib/academy-data";
import { LessonProgress } from "./LessonProgress";

type Params = { locale: string; slug: string; lesson: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const course of COURSES) {
    for (const lesson of course.lessons) {
      for (const lc of ACTIVE_LOCALES) {
        out.push({ locale: lc, slug: course.slug, lesson: lesson.slug });
      }
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, slug, lesson: lessonSlug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const course = getCourse(slug);
  if (!course) return { robots: { index: false } };
  const lesson = course.lessons.find((l) => l.slug === lessonSlug);
  if (!lesson) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `${lesson.title} — ${course.title}`,
    description: lesson.description,
    pathFor: (lc) => localePath(lc, `/academy/${slug}/${lessonSlug}`),
  });
}

export default async function AcademyLessonPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug, lesson: lessonSlug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const course = getCourse(slug);
  if (!course) notFound();

  const idx = course.lessons.findIndex((l) => l.slug === lessonSlug);
  if (idx === -1) notFound();
  const lesson = course.lessons[idx];

  const prev = idx > 0 ? course.lessons[idx - 1] : null;
  const next = idx < course.lessons.length - 1 ? course.lessons[idx + 1] : null;

  const pageUrl = `${SITE.url}${localePath(locale, `/academy/${slug}/${lessonSlug}`)}`;

  // Split content on double newline for paragraph rendering
  const paragraphs = lesson.content.split(/\n\n+/).filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        name: lesson.title,
        teaches: lesson.description,
        timeRequired: `PT${lesson.durationMin}M`,
        inLanguage: locale,
        url: pageUrl,
        isAccessibleForFree: lesson.free,
        isPartOf: {
          "@type": "Course",
          name: course.title,
          url: `${SITE.url}${urls.academyPath(locale, course.slug)}`,
        },
        publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Academy",
            item: `${SITE.url}${urls.academy(locale)}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: course.title,
            item: `${SITE.url}${urls.academyPath(locale, course.slug)}`,
          },
          { "@type": "ListItem", position: 3, name: lesson.title },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="border-b border-border-subtle">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <nav
            className="font-mono text-[11px] text-text-muted"
            aria-label="Breadcrumb"
          >
            <Link href={urls.academy(locale)} className="hover:text-text-primary">
              Academy
            </Link>
            <span className="mx-2 text-border-default">/</span>
            <Link
              href={urls.academyPath(locale, course.slug)}
              className="hover:text-text-primary"
            >
              {course.title}
            </Link>
            <span className="mx-2 text-border-default">/</span>
            <span className="text-text-secondary">Lesson {idx + 1}</span>
          </nav>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
          {/* Left sidebar */}
          <aside className="md:sticky md:top-6 md:self-start space-y-4">
            {/* Course title */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Course
              </p>
              <Link
                href={urls.academyPath(locale, course.slug)}
                className="mt-1 block text-sm font-semibold text-text-primary hover:text-accent"
              >
                {course.title}
              </Link>
              <p className="mt-0.5 font-mono text-[10px] text-text-muted">
                {LEVEL_LABEL[course.level]}
              </p>
            </div>

            {/* Lesson list */}
            <nav aria-label="Course lessons">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Lessons
              </p>
              <ol className="space-y-1">
                {course.lessons.map((l, i) => {
                  const isCurrent = l.slug === lessonSlug;
                  return (
                    <li key={l.slug}>
                      {l.free || isCurrent ? (
                        <Link
                          href={urls.academyLesson(locale, course.slug, l.slug)}
                          className={`flex items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors ${
                            isCurrent
                              ? "bg-accent/10 font-semibold text-accent"
                              : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                          }`}
                          aria-current={isCurrent ? "page" : undefined}
                        >
                          <span className="flex-none font-mono text-[10px] text-text-muted w-4">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="flex-none text-[11px]">
                            {LESSON_TYPE_ICON[l.type]}
                          </span>
                          <span className="truncate">{l.title}</span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2 rounded px-2 py-1.5 text-xs text-text-muted">
                          <span className="flex-none font-mono text-[10px] w-4">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="flex-none text-[11px]">🔒</span>
                          <span className="truncate">{l.title}</span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>

            {/* Back to course */}
            <Link
              href={urls.academyPath(locale, course.slug)}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] text-text-muted hover:text-accent"
            >
              ← Back to course
            </Link>
          </aside>

          {/* Main content */}
          <main className="min-w-0 space-y-8">
            {/* Lesson header */}
            <header>
              {/* Type badge + duration */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded border border-border-subtle bg-bg-elevated px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  {LESSON_TYPE_ICON[lesson.type]} {lesson.type}
                </span>
                <span className="font-mono text-[11px] text-text-muted">
                  {lesson.durationMin} min
                </span>
                {lesson.free ? (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                    Free
                  </span>
                ) : (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    🔒 Pro
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
                {lesson.title}
              </h1>
              <p className="mt-2 text-text-secondary">{lesson.description}</p>

              {/* Prev / Next navigation */}
              <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[11px] text-text-muted">
                {prev ? (
                  <Link
                    href={urls.academyLesson(locale, course.slug, prev.slug)}
                    className="hover:text-accent"
                  >
                    ← {prev.title}
                  </Link>
                ) : (
                  <span>First lesson</span>
                )}
                {(prev || next) && <span>·</span>}
                {next ? (
                  <Link
                    href={urls.academyLesson(locale, course.slug, next.slug)}
                    className="hover:text-accent"
                  >
                    {next.title} →
                  </Link>
                ) : (
                  <span>Last lesson</span>
                )}
              </div>
            </header>

            {/* Lesson content */}
            <section className="space-y-4">
              {paragraphs.map((para, i) => (
                <p key={i} className="text-text-secondary leading-relaxed">
                  {para}
                </p>
              ))}
            </section>

            {/* Interactive placeholder */}
            {lesson.type === "interactive" && (
              <div className="rounded border-2 border-dashed border-border-subtle p-8 text-center text-text-muted">
                Interactive exercise loads here (Phase 2)
              </div>
            )}

            {/* Progress tracker */}
            <LessonProgress
              courseSlug={course.slug}
              lessonSlug={lesson.slug}
              totalLessons={course.lessons.length}
            />

            {/* Bottom navigation */}
            <nav
              className="grid grid-cols-1 gap-3 md:grid-cols-2"
              aria-label="Lesson navigation"
            >
              {prev ? (
                <Link
                  href={urls.academyLesson(locale, course.slug, prev.slug)}
                  className="rounded border border-border-subtle bg-bg-surface px-4 py-3 hover:bg-bg-elevated"
                >
                  <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    Previous lesson
                  </div>
                  <div className="mt-1 text-sm text-text-primary">
                    ← {prev.title}
                  </div>
                </Link>
              ) : (
                <div className="rounded border border-dashed border-border-subtle px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  First lesson in course
                </div>
              )}

              {next ? (
                <Link
                  href={urls.academyLesson(locale, course.slug, next.slug)}
                  className="rounded border border-border-subtle bg-bg-surface px-4 py-3 hover:bg-bg-elevated md:text-right"
                >
                  <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    Next lesson
                  </div>
                  <div className="mt-1 text-sm text-text-primary">
                    {next.title} →
                  </div>
                </Link>
              ) : (
                <Link
                  href={urls.academyPath(locale, course.slug)}
                  className="rounded border border-accent bg-bg-surface px-4 py-3 hover:bg-bg-elevated md:text-right"
                >
                  <div className="font-mono text-[10px] uppercase tracking-wider text-accent">
                    Course complete
                  </div>
                  <div className="mt-1 text-sm text-text-primary">
                    Return to {course.title} →
                  </div>
                </Link>
              )}
            </nav>
          </main>
        </div>
      </div>
    </>
  );
}
