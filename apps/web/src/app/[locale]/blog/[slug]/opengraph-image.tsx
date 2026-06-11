import { ImageResponse } from "next/og";
import { getPost } from "@/lib/blog-seed";

export const runtime = "edge";
export const alt = "Blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function BlogPostOG({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const post = getPost(params.slug);
  const title = post?.title ?? "Aegis Lens Intelligence Brief";
  const category = post?.category ?? "Briefs";
  const author = post?.author ?? "Aegis Lens";
  const readingTime = post?.readingTimeMin ?? 0;
  const isAI = post?.aiGenerated ?? false;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0d12",
          backgroundImage:
            "radial-gradient(ellipse at top right, rgba(255,107,53,0.15), transparent 55%)",
          color: "#e8edf5",
          fontFamily: "Inter, system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          padding: "70px 80px",
          justifyContent: "space-between",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 10,
              height: 10,
              backgroundColor: "#ff6b35",
              borderRadius: 999,
            }}
          />
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 20,
              letterSpacing: 2,
              color: "#ff6b35",
              textTransform: "uppercase",
            }}
          >
            Aegis Lens · {category}
          </div>
          {isAI && (
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 16,
                letterSpacing: 1,
                color: "#9ba6b8",
                textTransform: "uppercase",
                border: "1px solid rgba(155,166,184,0.3)",
                padding: "2px 8px",
                borderRadius: 4,
              }}
            >
              AI-assisted
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: title.length > 80 ? 46 : title.length > 50 ? 54 : 62,
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: 1050,
            }}
          >
            {title.length > 120 ? title.slice(0, 120) + "…" : title}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              fontFamily: "monospace",
              fontSize: 20,
              color: "#9ba6b8",
            }}
          >
            <span>{author}</span>
            {readingTime > 0 && (
              <>
                <span style={{ color: "#3a3f4d" }}>·</span>
                <span>{readingTime} min read</span>
              </>
            )}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
