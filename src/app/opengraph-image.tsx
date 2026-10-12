import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const alt = "Fidexa — custom software, web applications, and native Apple apps";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "#f4f1e8", color: "#172b22" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 42, fontWeight: 700 }}>{site.name}</div>
        <div style={{ fontSize: 20 }}>Independent software studio</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 70, fontWeight: 700, lineHeight: 1.12, maxWidth: 990 }}>Software products from first idea to everyday use.</div>
        <div style={{ fontSize: 27 }}>Web applications · Native Apple apps · Business systems</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #b8c3b8", paddingTop: 22, fontSize: 22 }}>
        <div>{`${site.location} · Remote`}</div><div>fidexa.org</div>
      </div>
    </div>,
    size,
  );
}
