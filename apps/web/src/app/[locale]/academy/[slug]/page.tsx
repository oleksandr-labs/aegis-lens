import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";
import {
  COURSES,
  getCourse,
  LEVEL_LABEL,
  LESSON_TYPE_ICON,
  COURSE_OUTCOMES,
  COURSE_REQUIREMENTS,
} from "@/lib/academy-data";

type Params = { locale: string; slug: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const course of COURSES) {
    for (const lc of ACTIVE_LOCALES) {
      out.push({ locale: lc, slug: course.slug });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const course = getCourse(slug);
  if (!course) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: course.title,
    description: course.subtitle,
    pathFor: (lc) => localePath(lc, `/academy/${course.slug}`),
  });
}

export default async function AcademyCoursePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const course = getCourse(slug);
  if (!course) notFound();

  const pageUrl = `${SITE.url}${localePath(locale, `/academy/${course.slug}`)}`;
  const outcomes = COURSE_OUTCOMES[course.slug] ?? [];
  const requirement = COURSE_REQUIREMENTS[course.slug] ?? "No prior experience needed.";
  const freeCount = course.lessons.filter((l) => l.free).length;
  const hours = Math.round((course.durationMin / 60) * 10) / 10;

  const relatedCourses = COURSES.filter(
    (c) =>
      c.slug !== course.slug &&
      c.tags.some((t) => course.tags.includes(t)),
  ).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        name: course.title,
        description: course.subtitle,
        provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
        educationalLevel: course.level,
        inLanguage: locale,
        url: pageUrl,
        isAccessibleForFree: course.free,
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "online",
          courseWorkload: `PT${course.durationMin}M`,
        },
      },
      ...course.lessons.map((l) => ({
        "@type": "LearningResource",
        name: l.title,
        teaches: l.description,
        timeRequired: `PT${l.durationMin}M`,
        inLanguage: locale,
        isPartOf: { "@type": "Course", name: course.title, url: pageUrl },
      })),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Academy",
            item: `${SITE.url}${urls.academy(locale)}`,
          },
          { "@type": "ListItem", position: 2, name: course.title },
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

      <article>
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
              <span className="text-text-secondary">{course.title}</span>
            </nav>
          </div>
        </div>

        {/* Course hero */}
        <div className="border-b border-border-subtle bg-bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-10">
            {/* Level + category badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                  course.level === "beginner"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : course.level === "intermediate"
                      ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                      : "border-rose-500/20 bg-rose-500/10 text-rose-400"
                }`}
              >
                {LEVEL_LABEL[course.level]}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                {course.category}
              </span>
              {course.certificate && (
                <span className="inline-flex items-center rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                  Certificate
                </span>
              )}
            </div>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-text-primary md:text-5xl">
              {course.title}
            </h1>
            <p className="mt-3 max-w-2xl text-pretty text-text-secondary">
              {course.subtitle}
            </p>

            {/* Meta row */}
            <div className="mt-5 flex flex-wrap items-center gap-4 font-mono text-[11px] text-text-muted">
              <span>{hours}h total</span>
              <span>·</span>
              <span>{course.lessons.length} lessons</span>
              <span>·</span>
              <span>{freeCount} free</span>
              {course.certificate && (
                <>
                  <span>·</span>
                  <span className="text-accent">Certificate of completion</span>
                </>
              )}
            </div>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {course.tags.map((t) => (
                <Link
                  key={t}
                  href={urls.tag(locale, t)}
                  className="inline-flex items-center rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted hover:text-accent"
                >
                  {t}
                </Link>
              ))}
            </div>

            {/* Enrollment CTA */}
            <div className="mt-7">
              <Link
                href={
                  course.free
                    ? urls.academyLesson(locale, course.slug, course.lessons[0].slug)
                    : urls.pricing(locale)
                }
                className="inline-flex items-center gap-2 rounded bg-accent px-5 py-2.5 text-sm font-semibold text-bg-base hover:opacity-90 transition-opacity"
              >
                {course.free ? "Enroll (free)" : "Enroll ($49)"}
              </Link>
              {course.free && (
                <p className="mt-2 font-mono text-[10px] text-text-muted">
                  No account required for free lessons
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl grid grid-cols-1 gap-10 px-4 py-10 md:grid-cols-[1fr_300px]">
          {/* Left: curriculum + what you'll learn */}
          <div className="space-y-10">
            {/* What you'll learn */}
            {outcomes.length > 0 && (
              <section>
                <h2 className="text-base font-semibold text-text-primary">
                  What you&apos;ll learn
                </h2>
                <ul className="mt-3 space-y-2">
                  {outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="mt-0.5 flex-none text-accent">✓</span>
                      {outcome}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Curriculum */}
            <section>
              <h2 className="text-base font-semibold text-text-primary">
                Curriculum
              </h2>
              <ol className="mt-3 space-y-2">
                {course.lessons.map((lesson, idx) => (
                  <li
                    key={lesson.slug}
                    className="flex items-center gap-4 rounded border border-border-subtle bg-bg-surface p-3"
                  >
                    {/* Number */}
                    <div className="flex-none w-6 font-mono text-sm font-semibold text-accent">
                      {String(idx + 1).padStart(2, "0")}
                    </div>

                    {/* Type icon */}
                    <span className="flex-none text-base" title={lesson.type}>
                      {LESSON_TYPE_ICON[lesson.type]}
                    </span>

                    {/* Title + description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {lesson.free ? (
                          <Link
                            href={urls.academyLesson(locale, course.slug, lesson.slug)}
                            className="text-sm font-medium text-text-primary hover:text-accent"
                          >
                            {lesson.title}
                          </Link>
                        ) : (
                          <span className="text-sm font-medium text-text-primary">
                            {lesson.title}
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-text-muted">
                          {lesson.durationMin} min
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-text-muted">
                        {lesson.description}
                      </p>
                    </div>

                    {/* Free / locked indicator */}
                    <div className="flex-none">
                      {lesson.free ? (
                        <Link
                          href={urls.academyLesson(locale, course.slug, lesson.slug)}
                          className="font-mono text-[11px] text-accent hover:underline"
                        >
                          →
                        </Link>
                      ) : (
                        <span className="text-sm text-text-muted" title="Pro lesson">
                          🔒
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Requirements */}
            <section>
              <h2 className="text-base font-semibold text-text-primary">
                Requirements
              </h2>
              <p className="mt-2 text-sm text-text-secondary">{requirement}</p>
            </section>
          </div>

          {/* Right: sticky sidebar summary */}
          <aside className="space-y-6">
            <div className="rounded border border-border-subtle bg-bg-surface p-4 space-y-3 md:sticky md:top-6">
              <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Course summary
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-muted">Level</dt>
                  <dd className="text-text-primary">{LEVEL_LABEL[course.level]}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Duration</dt>
                  <dd className="text-text-primary">{hours}h</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Lessons</dt>
                  <dd className="text-text-primary">{course.lessons.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Certificate</dt>
                  <dd className="text-text-primary">
                    {course.certificate ? "Yes" : "No"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Price</dt>
                  <dd className="text-text-primary">
                    {course.free ? "Free" : "$49"}
                  </dd>
                </div>
              </dl>
              <Link
                href={
                  course.free
                    ? urls.academyLesson(locale, course.slug, course.lessons[0].slug)
                    : urls.pricing(locale)
                }
                className="mt-2 block w-full rounded bg-accent py-2 text-center text-sm font-semibold text-bg-base hover:opacity-90 transition-opacity"
              >
                {course.free ? "Start learning" : "Enroll ($49)"}
              </Link>
            </div>

            {/* Related courses */}
            {relatedCourses.length > 0 && (
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Related courses
                </div>
                <ul className="space-y-2">
                  {relatedCourses.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={urls.academyPath(locale, r.slug)}
                        className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                      >
                        {r.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </article>
    </>
  );
}
