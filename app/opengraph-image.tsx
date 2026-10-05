import { ImageResponse } from "next/og";

export const alt = "deepsoch podcast: your conversation, re-cut for every screen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Link preview for every page: forest ink, bone text, lime highlight (see globals.css tokens).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: 72, background: "#10231C", color: "#EFEBE3" }}>
        <div style={{ display: "flex", fontSize: 28, letterSpacing: "-0.04em" }}>deepsoch® podcast</div>
        <div style={{ display: "flex", flexWrap: "wrap", fontSize: 92, lineHeight: 1, letterSpacing: "-0.05em" }}>
          <span>Your conversation, re-cut for&nbsp;</span>
          <span style={{ background: "#C6F432", color: "#10231C", padding: "0 12px" }}>every screen.</span>
        </div>
      </div>
    ),
    size,
  );
}
