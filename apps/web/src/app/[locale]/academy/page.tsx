import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";
import {
  COURSES,
  LEVEL_LABEL,
  LESSON_TYPE_ICON,
  type Course,
} from "@/lib/academy-data";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Aegis Lens Academy";
const DESCRIPTION =
  "Learn OSINT, verification, and conflict intelligence. Courses for beginners to advanced analysts.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: "Academy",
    description: DESCRIPTION,
    pathFor: (lc) => localePath(lc, "/academy"),
  });
}

const TOTAL_LESSONS = COURSES.reduce((sum, c) => sum + c.lessons.length, 0);
const TOTAL_CERTS = COURSES.filter((c) => c.certificate).length;

function LevelBadge({ level }: { level: Course["level"] }) {
  const colors: Record<Course["level"], string> = {
    beginner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    advanced: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${colors[level]}`}
    >
      {LEVEL_LABEL[level]}
    </span>
  );
}

function CourseCard({
  course,
  locale,
  large,
}: {
  course: Course;
  locale: Locale;
  large?: boolean;
}) {
  const href = urls.academyPath(locale, course.slug);
  const freeLesson = course.lessons.find((l) => l.free);

  return (
    <Link
      href={href}
      className={`group flex h-full flex-col rounded border border-border-subtle bg-bg-surface p-5 hover:bg-bg-elevated transition-colors ${large ? "gap-4" : "gap-3"}`}
    >
      {/* Top row: badges */}
      <div className="flex flex-wrap items-center gap-2">
        <LevelBadge level={course.level} />
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
          {course.category}
        </span>
        {course.free ? (
          <span className="ml-auto inline-flex items-center rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400">
            Free
          </span>
        ) : (
          <span className="ml-auto inline-flex items-center rounded border border-border-subtle px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
            $49
          </span>
        )}
        {course.certificate && (
          <span className="inline-flex items-center rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
            Certificate
          </span>
        )}
      </div>

      {/* Title + subtitle */}
      <div>
        <h2
          className={`font-semibold text-text-primary group-hover:text-accent transition-colors ${large ? "text-xl" : "text-base"}`}
        >
          {course.title}
        </h2>
        <p className={`mt-1 text-text-secondary ${large ? "text-sm" : "text-xs"}`}>
          {course.subtitle}
        </p>
      </div>

      {/* Meta: duration + lessons */}
      <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-text-muted">
        <span>{Math.round(course.durationMin / 60 * 10) / 10}h</span>
        <span>·</span>
        <span>{course.lessons.length} lessons</span>
        {large && (
          <>
            <span>·</span>
            <span>
              {course.lessons.filter((l) => l.free).length} free{" "}
              {course.lessons.filter((l) => l.free).length === 1
                ? "lesson"
                : "lessons"}
            </span>
          </>
        )}
      </div>

      {/* Tags */}
      {large && (
        <div className="flex flex-wrap gap-1.5">
          {course.tags.map((t) => (
            <span
              key={t}
              className="rounded border border-border-subtle bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-text-muted"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Lesson preview (large only) */}
      {large && (
        <div className="mt-auto border-t border-border-subtle pt-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            First free lesson
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {freeLesson
              ? `${LESSON_TYPE_ICON[freeLesson.type]} ${freeLesson.title}`
              : course.lessons[0]?.title}
          </p>
        </div>
      )}

      {/* CTA */}
      <div className={`${large ? "" : "mt-auto"} font-mono text-[11px] text-accent group-hover:underline`}>
        Start course →
      </div>
    </Link>
  );
}

const LEARNING_PATHS = [
  {
    name: "OSINT Analyst",
    icon: "🔍",
    steps: [
      { label: "OSINT Fundamentals", slug: "osint-fundamentals" },
      { label: "Geolocation Masterclass", slug: "geolocation-masterclass" },
      { label: "Conflict Intelligence Analysis", slug: "conflict-intelligence" },
    ],
  },
  {
    name: "Journalist",
    icon: "📰",
    steps: [
      { label: "OSINT Fundamentals", slug: "osint-fundamentals" },
      { label: "Conflict Intelligence Analysis", slug: "conflict-intelligence" },
    ],
  },
  {
    name: "Developer",
    icon: "⚙️",
    steps: [],
    comingSoon: true,
    docsLink: true,
  },
];

export default async function AcademyIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const featuredCourses = COURSES.filter((c) => c.popular);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE.url}${localePath(locale, "/academy")}`,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: COURSES.length,
      itemListElement: COURSES.map((c, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE.url}${localePath(locale, `/academy/${c.slug}`)}`,
        name: c.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <PageHeader
        eyebrow="Academy"
        title={TITLE}
        description={DESCRIPTION}
      />

      {/* Stats bar */}
      <div className="border-b border-border-subtle bg-bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-6 px-4 py-4">
          {[
            { value: String(COURSES.length), label: "courses" },
            { value: String(TOTAL_LESSONS), label: "lessons" },
            { value: "Free + Paid", label: "tracks" },
            { value: String(TOTAL_CERTS), label: "certificates offered" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-1.5">
              <span className="font-mono text-lg font-semibold text-text-primary">
                {stat.value}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-14 px-4 py-12">
        {/* Featured courses */}
        {featuredCourses.length > 0 && (
          <section>
            <h2 className="mb-5 font-mono text-xs uppercase tracking-widest text-text-muted">
              Featured courses
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {featuredCourses.map((course) => (
                <CourseCard
                  key={course.slug}
                  course={course}
                  locale={locale}
                  large
                />
              ))}
            </div>
          </section>
        )}

        {/* All courses grid */}
        <section>
          <h2 className="mb-5 font-mono text-xs uppercase tracking-widest text-text-muted">
            All courses
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {COURSES.map((course) => (
              <CourseCard key={course.slug} course={course} locale={locale} />
            ))}
          </div>
        </section>

        {/* Learning paths */}
        <section>
          <h2 className="mb-1 font-mono text-xs uppercase tracking-widest text-text-muted">
            Learning paths
          </h2>
          <p className="mb-5 text-sm text-text-secondary">
            Curated sequences for common goals.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {LEARNING_PATHS.map((path) => (
              <div
                key={path.name}
                className="rounded border border-border-subtle bg-bg-surface p-5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{path.icon}</span>
                  <h3 className="font-semibold text-text-primary">
                    {path.name}
                  </h3>
                </div>

                {path.comingSoon ? (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-text-muted">
                      API integration course coming soon.
                    </p>
                    <Link
                      href={urls.docs(locale)}
                      className="inline-block font-mono text-[11px] text-accent hover:underline"
                    >
                      Explore API docs →
                    </Link>
                  </div>
                ) : (
                  <ol className="mt-4 space-y-2">
                    {path.steps.map((step, i) => (
                      <li key={step.slug} className="flex items-start gap-2">
                        <span className="mt-0.5 flex-none font-mono text-[10px] text-text-muted">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <Link
                          href={urls.academyPath(locale, step.slug)}
                          className="text-xs text-text-secondary hover:text-accent hover:underline"
                        >
                          {step.label}
                        </Link>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            ))}
          </div>
        </section>

        <p className="text-xs text-text-muted">
          Self-paced. Free foundation paths; advanced modules available on Pro
          plans (see{" "}
          <Link href={urls.pricing(locale)} className="text-accent hover:underline">
            pricing
          </Link>
          ). Practical exercises link out to{" "}
          <Link href={urls.guides(locale)} className="text-accent hover:underline">
            /guides
          </Link>{" "}
          and the{" "}
          <Link href={urls.tools(locale)} className="text-accent hover:underline">
            tools directory
          </Link>
          .
        </p>
      </div>
    </>
  );
}
