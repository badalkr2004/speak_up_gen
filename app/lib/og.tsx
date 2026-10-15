import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "./site";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

async function loadLogo() {
  const data = await readFile(join(process.cwd(), "public/brand/logo-badge.png"));
  return `data:image/png;base64,${data.toString("base64")}`;
}

type OgProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
};

export async function createOgImage({
  title,
  subtitle = siteConfig.tagline,
  eyebrow = "Youth-run initiative",
}: OgProps) {
  const logo = await loadLogo();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#f3ede2",
          color: "#171713",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        {/* grain-ish dots */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(30,106,68,0.08) 0, transparent 42%), radial-gradient(circle at 85% 15%, rgba(216,67,42,0.1) 0, transparent 35%), radial-gradient(circle at 70% 80%, rgba(214,244,92,0.35) 0, transparent 40%)",
          }}
        />

        {/* left accent bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 18,
            background: "#1e6a44",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px 56px 88px",
            width: "100%",
            height: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#1e6a44",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  background: "#d8432a",
                  borderRadius: 999,
                  display: "flex",
                }}
              />
              {eyebrow}
            </div>
            <img
              src={logo}
              width={148}
              height={148}
              alt=""
              style={{ borderRadius: 999, boxShadow: "0 18px 40px rgba(23,23,19,0.18)" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 820 }}>
            <div
              style={{
                fontSize: title.length > 28 ? 68 : 84,
                fontWeight: 800,
                lineHeight: 0.92,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 8,
                  background: "#d6f45c",
                  borderRadius: 4,
                  display: "flex",
                }}
              />
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 600,
                  color: "#55554b",
                  display: "flex",
                }}
              >
                {subtitle}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              fontSize: 22,
              color: "#55554b",
            }}
          >
            <div style={{ display: "flex" }}>Aware · Think · Speak · Change</div>
            <div
              style={{
                display: "flex",
                padding: "10px 18px",
                borderRadius: 999,
                background: "#171713",
                color: "#f3ede2",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              speakupgen
            </div>
          </div>
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
