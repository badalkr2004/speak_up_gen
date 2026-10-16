import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "./site";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

async function loadLogo() {
  // Opaque RGB PNG — Satori is unreliable with large transparent RGBA assets.
  // Use a data URL string so TypeScript and ImageResponse both accept `src`.
  const data = await readFile(join(process.cwd(), "public/brand/logo-og.png"));
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
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(30,106,68,0.08) 0, transparent 42%), radial-gradient(circle at 85% 15%, rgba(216,67,42,0.1) 0, transparent 35%), radial-gradient(circle at 70% 80%, rgba(214,244,92,0.35) 0, transparent 40%)",
            display: "flex",
          }}
        />

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
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "56px 64px 56px 88px",
            width: "100%",
            height: "100%",
            gap: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
              flex: 1,
              maxWidth: 720,
            }}
          >
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

            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div
                style={{
                  fontSize: title.length > 28 ? 58 : 72,
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
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
                    fontSize: 32,
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
                alignItems: "center",
                gap: 16,
                fontSize: 22,
                color: "#55554b",
              }}
            >
              <div style={{ display: "flex" }}>Aware · Think · Speak · Change</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <img
              src={logo}
              width={360}
              height={360}
              alt=""
              style={{
                borderRadius: 180,
                boxShadow: "0 24px 48px rgba(23,23,19,0.22)",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
