export type LessonType = "text" | "video" | "interactive" | "quiz";
export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type Lesson = {
  slug: string;
  title: string;
  type: LessonType;
  durationMin: number;
  description: string;
  content: string; // plain text content
  free: boolean;
};

export type Course = {
  slug: string;
  title: string;
  subtitle: string;
  level: CourseLevel;
  category: string;
  durationMin: number;
  lessons: Lesson[];
  tags: string[];
  free: boolean; // is the full course free?
  popular: boolean;
  certificate: boolean;
};

export const COURSES: Course[] = [
  {
    slug: "osint-fundamentals",
    title: "OSINT Fundamentals",
    subtitle: "From zero to your first verified intelligence report",
    level: "beginner",
    category: "OSINT",
    durationMin: 120,
    free: true,
    popular: true,
    certificate: false,
    tags: ["osint", "verification", "geolocation"],
    lessons: [
      {
        slug: "what-is-osint",
        title: "What is OSINT?",
        type: "text",
        durationMin: 10,
        free: true,
        description: "Introduction to open-source intelligence.",
        content:
          "Open-source intelligence (OSINT) is the collection and analysis of data gathered from public sources...",
      },
      {
        slug: "source-evaluation",
        title: "Evaluating sources",
        type: "text",
        durationMin: 15,
        free: true,
        description: "How to assess source reliability and spot manipulation.",
        content:
          "Not all sources are equal. Learn to evaluate credibility using the SIFT framework...",
      },
      {
        slug: "basic-geolocation",
        title: "Basic geolocation",
        type: "interactive",
        durationMin: 25,
        free: true,
        description: "Geolocate images using visual cues and reverse search.",
        content:
          "Geolocation is the process of determining where an image or video was taken...",
      },
      {
        slug: "reverse-image-search",
        title: "Reverse image search",
        type: "text",
        durationMin: 20,
        free: true,
        description: "Using Google, TinEye, and Yandex for image verification.",
        content:
          "Reverse image search is your first line of defense against recycled imagery...",
      },
      {
        slug: "first-report",
        title: "Writing your first OSINT report",
        type: "text",
        durationMin: 20,
        free: false,
        description:
          "Structuring findings, citing sources, and presenting conclusions.",
        content: "A good OSINT report tells a story backed by evidence...",
      },
    ],
  },
  {
    slug: "conflict-intelligence",
    title: "Conflict Intelligence Analysis",
    subtitle: "Understanding and analyzing armed conflict using open sources",
    level: "intermediate",
    category: "Intelligence",
    durationMin: 180,
    free: false,
    popular: true,
    certificate: true,
    tags: ["conflict", "military", "analysis"],
    lessons: [
      {
        slug: "conflict-anatomy",
        title: "Anatomy of a conflict",
        type: "text",
        durationMin: 20,
        free: true,
        description:
          "Key actors, phases, and dynamics in modern armed conflicts.",
        content: "Understanding conflict requires a framework...",
      },
      {
        slug: "battlefield-osint",
        title: "Battlefield OSINT",
        type: "text",
        durationMin: 30,
        free: false,
        description: "Tracking frontlines, equipment, and force movements.",
        content: "Battlefield intelligence has unique challenges...",
      },
      {
        slug: "satellite-imagery",
        title: "Satellite imagery analysis",
        type: "interactive",
        durationMin: 40,
        free: false,
        description:
          "Reading Sentinel-2 and commercial imagery for ground truth.",
        content:
          "Satellite imagery is one of the most powerful OSINT tools...",
      },
      {
        slug: "equipment-identification",
        title: "Military equipment identification",
        type: "text",
        durationMin: 30,
        free: false,
        description: "Identifying vehicles, aircraft, and weapons in imagery.",
        content: "Equipment identification requires systematic training...",
      },
    ],
  },
  {
    slug: "geolocation-masterclass",
    title: "Geolocation Masterclass",
    subtitle: "Advanced techniques for locating images, videos, and events",
    level: "advanced",
    category: "OSINT",
    durationMin: 240,
    free: false,
    popular: false,
    certificate: true,
    tags: ["geolocation", "osint", "forensics"],
    lessons: [
      {
        slug: "sun-angle-analysis",
        title: "Sun angle and shadow analysis",
        type: "interactive",
        durationMin: 45,
        free: true,
        description: "Using sun position to determine time and location.",
        content: "The sun casts shadows that reveal location and time...",
      },
      {
        slug: "building-signature",
        title: "Building signature matching",
        type: "text",
        durationMin: 40,
        free: false,
        description: "Matching architectural features to satellite imagery.",
        content: "Buildings are unique fingerprints on the landscape...",
      },
      {
        slug: "terrain-analysis",
        title: "Terrain and vegetation analysis",
        type: "text",
        durationMin: 35,
        free: false,
        description:
          "Using elevation, vegetation, and terrain for geolocation.",
        content:
          "Terrain is one of the most reliable geolocation anchors...",
      },
    ],
  },
];

export function getCourse(slug: string): Course | null {
  return COURSES.find((c) => c.slug === slug) ?? null;
}

export function getLesson(
  courseSlug: string,
  lessonSlug: string,
): { course: Course; lesson: Lesson; index: number } | null {
  const course = getCourse(courseSlug);
  if (!course) return null;
  const index = course.lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) return null;
  return { course, lesson: course.lessons[index], index };
}

export const LESSON_TYPE_ICON: Record<LessonType, string> = {
  text: "📖",
  video: "🎬",
  interactive: "⚡",
  quiz: "❓",
};

export const LEVEL_LABEL: Record<CourseLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const COURSE_OUTCOMES: Record<string, string[]> = {
  "osint-fundamentals": [
    "Understand what OSINT is and where it fits in the intelligence cycle",
    "Evaluate source reliability using the SIFT framework",
    "Geolocate images using visual cues, shadow analysis, and reverse search",
    "Verify imagery using multiple independent search engines",
    "Write a structured OSINT report with properly cited sources",
  ],
  "conflict-intelligence": [
    "Identify key actors, phases, and dynamics in modern armed conflicts",
    "Track frontline movements and equipment using open-source data",
    "Interpret Sentinel-2 and commercial satellite imagery",
    "Identify military vehicles, aircraft, and weapons from imagery",
    "Produce a conflict intelligence brief backed by verified open sources",
  ],
  "geolocation-masterclass": [
    "Use sun angle and shadow length to constrain location and time of day",
    "Match building signatures and architectural features to satellite imagery",
    "Apply terrain and vegetation analysis as geolocation anchors",
    "Combine multiple geolocation signals to triangulate a precise location",
  ],
};

export const COURSE_REQUIREMENTS: Record<string, string> = {
  "osint-fundamentals": "Just curiosity. No prior experience needed.",
  "conflict-intelligence":
    "Completion of OSINT Fundamentals recommended.",
  "geolocation-masterclass":
    "Completion of OSINT Fundamentals recommended.",
};
