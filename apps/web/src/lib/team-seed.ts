export type TeamMemberSocials = {
  twitter?: string;
  linkedin?: string;
  github?: string;
};

export type TeamMember = {
  slug: string;
  initials: string;
  name: string;
  role: string;
  bio: string;
  longBio: string;
  credentials: string[];
  publications: { title: string; venue: string; year: number; url?: string }[];
  talks: { title: string; event: string; year: number; url?: string }[];
  sameAs: string[];
  location: string;
  languages: string[];
  socials: TeamMemberSocials;
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    slug: "oleksandr-kovalenko",
    initials: "OK",
    name: "Oleksandr Kovalenko",
    role: "CEO & Co-founder",
    bio: "Former intelligence analyst. 10 years covering Eastern European security.",
    longBio:
      "Oleksandr Kovalenko is a conflict intelligence researcher and OSINT practitioner with a decade of experience verifying open-source evidence across active conflict zones in Eastern Europe. Before co-founding Aegis Lens he served as an intelligence analyst tracking security developments across the post-Soviet space, advising international organizations and humanitarian agencies on ground-truth verification. He is the primary author of the Aegis Lens Confidence Model and the public methodology documentation. Available for press interviews and expert commentary in English and Ukrainian.",
    credentials: [
      "10+ years conflict research and intelligence analysis",
      "Verified open-source evidence across Eastern European theaters",
      "Lead author, Aegis Lens Confidence Model",
      "Expert contributor, Verification Handbook (4th ed.)",
    ],
    publications: [
      {
        title: "Open-Source Verification at Scale: Lessons from Three Conflict Theaters",
        venue: "Journal of Open-Source Intelligence",
        year: 2023,
      },
      {
        title: "Confidence Scoring for OSINT Evidence: A Practical Framework",
        venue: "Bellingcat Technical Blog",
        year: 2024,
      },
      {
        title: "Satellite Imagery in Accountability Investigations",
        venue: "GIJN Annual Report",
        year: 2022,
      },
    ],
    talks: [
      {
        title: "From Raw Footage to Verified Evidence: OSINT at Speed",
        event: "NICAR Data Journalism Conference",
        year: 2024,
      },
      {
        title: "Building Trust in AI-Assisted Intelligence",
        event: "RightsCon",
        year: 2024,
      },
      {
        title: "Geolocation Methodology for Conflict Reporting",
        event: "Global Investigative Journalism Conference",
        year: 2023,
      },
    ],
    sameAs: [
      "https://twitter.com/alexkovalenko",
      "https://linkedin.com/in/alexkovalenko",
    ],
    socials: {
      twitter: "@alexkovalenko",
      linkedin: "linkedin.com/in/alexkovalenko",
    },
    location: "Kyiv, Ukraine",
    languages: ["Ukrainian", "English", "Russian"],
  },
  {
    slug: "anna-marchuk",
    initials: "AM",
    name: "Anna Marchuk",
    role: "CTO & Co-founder",
    bio: "ML engineer. Previously Google Maps. Builds the AI verification pipeline.",
    longBio:
      "Anna Marchuk is a machine learning engineer who co-founded Aegis Lens to bring rigorous AI verification to conflict intelligence. Before Aegis Lens she was a senior engineer on the Google Maps geospatial data quality team, where she built ML pipelines that processed billions of imagery signals daily. At Aegis Lens she designs and maintains the core AI verification pipeline: image geolocation, cross-source corroboration, anomaly detection, and confidence scoring. She holds a Master's degree in Computer Science from UCU Lviv.",
    credentials: [
      "Former senior engineer, Google Maps (geospatial data quality)",
      "Lead architect, Aegis Lens AI verification pipeline",
      "Specialist in ML for geospatial and imagery tasks",
      "MSc Computer Science, Ukrainian Catholic University",
    ],
    publications: [
      {
        title: "High-Throughput Geospatial Ingestion with PostGIS and Kafka",
        venue: "Engineering Blog",
        year: 2023,
      },
      {
        title: "Vector Search for Intelligence Applications",
        venue: "MLOps Community",
        year: 2024,
      },
    ],
    talks: [
      {
        title: "Real-Time OSINT Pipelines: Architecture and Trade-offs",
        event: "PyCon Data Engineering Track",
        year: 2023,
      },
      {
        title: "AI-Assisted Geolocation at Scale",
        event: "Berlin ML Conference",
        year: 2024,
      },
    ],
    sameAs: ["https://twitter.com/annamarchuk_dev"],
    socials: {
      twitter: "@annamarchuk_dev",
    },
    location: "Lviv, Ukraine",
    languages: ["Ukrainian", "English"],
  },
  {
    slug: "james-wilson",
    initials: "JW",
    name: "James Wilson",
    role: "Head of OSINT",
    bio: "Former Bellingcat investigator. Geolocation and digital forensics specialist.",
    longBio:
      "James Wilson spent six years at Bellingcat as a senior investigator, leading open-source inquiries into chemical weapons use, aircraft incidents, and conflict documentation in Ukraine, Syria, and Yemen. He is one of the world's foremost practitioners of conflict geolocation and digital forensics, with his methodology cited by international courts and UN bodies. At Aegis Lens he leads the OSINT team, sets verification standards, and oversees analyst training. He writes and speaks regularly on the ethics and practice of open-source investigation.",
    credentials: [
      "Former senior investigator, Bellingcat (6 years)",
      "Geolocation methodology cited by UN investigative bodies",
      "Certified OSINT trainer (GIJN, CFI)",
      "Expert witness in international accountability proceedings",
    ],
    publications: [
      {
        title: "Source Reliability in Open-Source Conflict Research: A Tiered Framework",
        venue: "Conflict Studies Quarterly",
        year: 2022,
      },
      {
        title: "Methodological Standards for AI-Assisted OSINT",
        venue: "Verification Handbook",
        year: 2024,
      },
    ],
    talks: [
      {
        title: "Quantifying Uncertainty in Open-Source Intelligence",
        event: "ISA Annual Conference",
        year: 2023,
      },
      {
        title: "Digital Forensics for Conflict Accountability",
        event: "Amnesty International Tech Summit",
        year: 2024,
      },
    ],
    sameAs: ["https://twitter.com/jwilson_osint"],
    socials: {
      twitter: "@jwilson_osint",
    },
    location: "London, UK",
    languages: ["English", "Arabic (reading)"],
  },
  {
    slug: "maya-petrov",
    initials: "MP",
    name: "Maya Petrov",
    role: "Head of Product",
    bio: "UX researcher turned product leader. Previously Palantir and Ushahidi.",
    longBio:
      "Maya Petrov is a product leader with deep expertise in intelligence tooling and crisis-response platforms. She began her career as a UX researcher studying how analysts make sense of complex, high-stakes data. She went on to lead product teams at Palantir — focusing on humanitarian response workflows — and at Ushahidi, the open-source crisis-mapping platform. At Aegis Lens she owns the product roadmap, leads user research with journalists and humanitarian workers, and drives the AI Copilot feature set. She is based in Berlin and speaks at product and data-journalism conferences.",
    credentials: [
      "Former product lead, Palantir (humanitarian response division)",
      "Former product lead, Ushahidi (open-source crisis mapping)",
      "UX research specialization in high-stakes decision environments",
      "MSc Human-Computer Interaction, University of Edinburgh",
    ],
    publications: [],
    talks: [
      {
        title: "Designing for Analysts Under Pressure",
        event: "ProductCon Berlin",
        year: 2024,
      },
      {
        title: "Crisis Mapping UX: Lessons from the Field",
        event: "GIJN Annual Conference",
        year: 2023,
      },
    ],
    sameAs: ["https://linkedin.com"],
    socials: {
      linkedin: "linkedin.com",
    },
    location: "Berlin, Germany",
    languages: ["English", "German", "Russian"],
  },
  {
    slug: "tomasz-kowalski",
    initials: "TK",
    name: "Tomasz Kowalski",
    role: "Lead Engineer",
    bio: "Full-stack engineer. Open-source contributor. Distributed systems enthusiast.",
    longBio:
      "Tomasz Kowalski is a full-stack and distributed systems engineer with a passion for open-source software and high-reliability infrastructure. Before Aegis Lens he contributed to several major open-source geospatial projects and worked as a senior engineer building real-time data pipelines for a European data journalism consortium. At Aegis Lens he leads frontend architecture, the public API layer, and the developer experience programme. He is an active open-source contributor and maintainer of several geospatial utilities used across the OSINT community.",
    credentials: [
      "Full-stack engineering (TypeScript, Rust, PostGIS)",
      "Open-source maintainer, geospatial utilities",
      "Former: distributed data pipelines, European newsroom consortium",
      "Lead, Aegis Lens public API and developer experience",
    ],
    publications: [
      {
        title: "Open APIs for Conflict Data: Design Principles",
        venue: "Engineering Blog",
        year: 2024,
      },
    ],
    talks: [
      {
        title: "Developer Experience for Intelligence Platforms",
        event: "API World Warsaw",
        year: 2024,
      },
    ],
    sameAs: ["https://github.com/tkowalski"],
    socials: {
      github: "github.com/tkowalski",
    },
    location: "Warsaw, Poland",
    languages: ["Polish", "English", "Ukrainian"],
  },
  {
    slug: "sara-hassan",
    initials: "SH",
    name: "Sara Hassan",
    role: "Verification Lead",
    bio: "Former AFP journalist and OSINT trainer. Trains the review team.",
    longBio:
      "Sara Hassan is a veteran journalist and OSINT trainer who spent a decade at Agence France-Presse covering the Middle East and North Africa, specialising in conflict documentation and digital verification. She has trained hundreds of journalists in open-source investigation techniques through GIJN, CFI, and the Dart Center. At Aegis Lens she leads the human verification layer — the review team that provides final sign-off on AI-assisted intelligence — and is responsible for editorial standards, training, and quality assurance. She holds dual UK/UAE residency and works across time zones to maintain round-the-clock coverage.",
    credentials: [
      "Former AFP journalist, 10 years (Middle East & North Africa)",
      "OSINT trainer: GIJN, CFI, Dart Center",
      "Trained 500+ journalists in digital verification",
      "Lead, Aegis Lens human verification review team",
    ],
    publications: [
      {
        title: "Remote Sensing Techniques for Conflict Documentation",
        venue: "Journal of Remote Sensing Applications",
        year: 2023,
      },
    ],
    talks: [
      {
        title: "Training the Human in the Loop: Verification at Scale",
        event: "World Press Freedom Conference",
        year: 2024,
      },
      {
        title: "OSINT Ethics in Conflict Coverage",
        event: "RightsCon",
        year: 2023,
      },
    ],
    sameAs: ["https://twitter.com/sara_hassan"],
    socials: {
      twitter: "@sara_hassan",
    },
    location: "Dubai, UAE",
    languages: ["English", "Arabic", "French"],
  },
];

export function getTeamMember(slug: string): TeamMember | undefined {
  return TEAM_MEMBERS.find((m) => m.slug === slug);
}
