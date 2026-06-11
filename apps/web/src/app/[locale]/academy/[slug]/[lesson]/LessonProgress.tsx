"use client";

import { useEffect, useState } from "react";

type Props = {
  courseSlug: string;
  lessonSlug: string;
  totalLessons: number;
};

export function LessonProgress({ courseSlug, lessonSlug, totalLessons }: Props) {
  const key = `aegis_course_${courseSlug}`;
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [marked, setMarked] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      const parsed: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      const set = new Set(parsed);
      setCompleted(set);
      setMarked(set.has(lessonSlug));
    } catch {
      // localStorage unavailable or corrupted — ignore
    }
  }, [key, lessonSlug]);

  function markComplete() {
    try {
      const next = new Set(completed);
      next.add(lessonSlug);
      localStorage.setItem(key, JSON.stringify([...next]));
      setCompleted(next);
      setMarked(true);
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded border border-border-subtle bg-bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          You&apos;ve completed{" "}
          <span className="font-semibold text-text-primary">
            {completed.size}/{totalLessons}
          </span>{" "}
          {totalLessons === 1 ? "lesson" : "lessons"} in this course.
        </p>
        {marked ? (
          <span className="inline-flex items-center gap-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-emerald-400">
            ✓ Completed
          </span>
        ) : (
          <button
            onClick={markComplete}
            className="rounded border border-border-subtle bg-bg-elevated px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-text-secondary hover:border-accent hover:text-accent transition-colors"
          >
            Mark as complete
          </button>
        )}
      </div>
    </div>
  );
}
