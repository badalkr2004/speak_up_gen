/**
 * Generates a non-technical PDF explainer of Speak Up Gen's organisation hierarchy.
 * Run: bun scripts/generate-hierarchy-explainer.mjs
 */

import PDFDocument from "pdfkit";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "docs", "Speak-Up-Gen-Organisation-Hierarchy.pdf");

const C = {
  paper: "#F3EDE2",
  paper2: "#E8DFCD",
  ink: "#171713",
  soft: "#55554B",
  leaf: "#1E6A44",
  leafDeep: "#0E3624",
  lime: "#D6F45C",
  coral: "#D8432A",
  sky: "#B9DEF0",
  white: "#FFFFFF",
  line: "#D4CBB8",
};

const PAGE = { w: 595.28, h: 841.89 }; // A4
const M = { l: 48, r: 48, t: 52, b: 56 };
const CONTENT_W = PAGE.w - M.l - M.r;

function drawPageBackground(doc) {
  doc.rect(0, 0, PAGE.w, PAGE.h).fill(C.paper);
}

function footer(doc, pageNum, total) {
  const y = PAGE.h - 36;
  doc.save();
  doc
    .moveTo(M.l, y - 10)
    .lineTo(PAGE.w - M.r, y - 10)
    .strokeColor(C.line)
    .lineWidth(0.8)
    .stroke();
  doc
    .fillColor(C.soft)
    .font("Helvetica")
    .fontSize(8)
    .text("Speak Up Gen  ·  Organisation Hierarchy Explainer", M.l, y, {
      width: CONTENT_W * 0.7,
      align: "left",
    });
  doc.text(`${pageNum} / ${total}`, M.l, y, {
    width: CONTENT_W,
    align: "right",
  });
  doc.restore();
}

function sectionTitle(doc, y, title) {
  doc
    .fillColor(C.leaf)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(title.toUpperCase(), M.l, y, { characterSpacing: 1.2 });
  return y + 22;
}

function bodyText(doc, y, text, opts = {}) {
  doc
    .fillColor(opts.color || C.ink)
    .font(opts.bold ? "Helvetica-Bold" : "Helvetica")
    .fontSize(opts.size || 10.5)
    .text(text, M.l, y, {
      width: CONTENT_W,
      align: opts.align || "left",
      lineGap: 3.5,
      ...opts,
    });
  return doc.y + (opts.after || 10);
}

function bullet(doc, y, text) {
  const bulletX = M.l;
  const textX = M.l + 14;
  doc.fillColor(C.leaf).circle(bulletX + 3, y + 5, 2.2).fill();
  doc
    .fillColor(C.ink)
    .font("Helvetica")
    .fontSize(10.5)
    .text(text, textX, y, { width: CONTENT_W - 14, lineGap: 3 });
  return doc.y + 8;
}

function card(doc, x, y, w, h, fill, border = C.ink) {
  doc.save();
  doc.roundedRect(x, y, w, h, 8).fill(fill);
  doc.roundedRect(x, y, w, h, 8).lineWidth(1.4).strokeColor(border).stroke();
  doc.restore();
}

function drawCover(doc) {
  drawPageBackground(doc);

  // Top lime band
  doc.rect(0, 0, PAGE.w, 14).fill(C.lime);
  doc.rect(0, 14, PAGE.w, 6).fill(C.leaf);

  // Brand block
  doc
    .fillColor(C.leaf)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("SPEAK UP GEN", M.l, 80, { characterSpacing: 2 });

  doc
    .fillColor(C.soft)
    .font("Helvetica")
    .fontSize(10)
    .text("Speak today. Shape the way.", M.l, 100);

  // Main title
  doc
    .fillColor(C.ink)
    .font("Helvetica-Bold")
    .fontSize(32)
    .text("How Our\nOrganisation\nWorks", M.l, 160, {
      width: CONTENT_W * 0.85,
      lineGap: 4,
    });

  // Accent bar
  doc.rect(M.l, 310, 72, 6).fill(C.coral);

  doc
    .fillColor(C.ink)
    .font("Helvetica")
    .fontSize(12)
    .text(
      "A simple guide to Speak Up Gen’s structure — written for leaders, partners, and anyone who wants to understand how we grow across India.",
      M.l,
      340,
      { width: CONTENT_W * 0.88, lineGap: 4 },
    );

  // Info chips
  const chips = [
    { label: "For non-technical readers", bg: C.sky },
    { label: "No jargon", bg: C.lime },
    { label: "Client explainer", bg: C.paper2 },
  ];
  let chipX = M.l;
  const chipY = 430;
  for (const chip of chips) {
    const tw = doc.widthOfString(chip.label) + 20;
    doc.roundedRect(chipX, chipY, tw, 26, 13).fill(chip.bg);
    doc
      .fillColor(C.ink)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(chip.label, chipX, chipY + 8, { width: tw, align: "center" });
    chipX += tw + 10;
  }

  // Bottom panel
  doc.roundedRect(M.l, 520, CONTENT_W, 180, 12).fill(C.leafDeep);
  doc
    .fillColor(C.lime)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("WHAT YOU WILL LEARN", M.l + 24, 544, { characterSpacing: 1 });

  const learn = [
    "How Speak Up Gen is organised from national level down to local teams",
    "Why local teams can be colleges, communities, workplaces, or other groups",
    "How a young person applies and who approves them",
    "What official member ID cards are for",
  ];
  let ly = 572;
  for (const item of learn) {
    doc.fillColor(C.lime).circle(M.l + 30, ly + 5, 2.5).fill();
    doc
      .fillColor(C.white)
      .font("Helvetica")
      .fontSize(10)
      .text(item, M.l + 42, ly, { width: CONTENT_W - 70, lineGap: 2 });
    ly = doc.y + 10;
  }

  doc
    .fillColor(C.soft)
    .font("Helvetica")
    .fontSize(9)
    .text("Document version 1.0  ·  November 2026", M.l, PAGE.h - 48);
}

function drawPage2(doc) {
  drawPageBackground(doc);
  let y = M.t;

  y = sectionTitle(doc, y, "1. The big idea");
  y = bodyText(
    doc,
    y,
    "Speak Up Gen is a youth-driven initiative. As we grow across India, we need a clear way to organise people — without becoming complicated or bureaucratic.",
  );
  y = bodyText(
    doc,
    y,
    "Think of the organisation like a tree:",
  );
  y = bullet(doc, y, "The roots and trunk keep everyone connected under one national identity.");
  y = bullet(doc, y, "Branches reach into states and cities.");
  y = bullet(doc, y, "Leaves are the local teams where real activity happens.");
  y = bodyText(
    doc,
    y + 4,
    "Every member belongs to a local team. Every local team sits under a city. Every city sits under a state. All states sit under Speak Up Gen National.",
    { after: 18 },
  );

  y = sectionTitle(doc, y, "2. The four levels");
  y = bodyText(
    doc,
    y,
    "We use four clear levels. Each level has a simple job.",
    { after: 14 },
  );

  const levels = [
    {
      n: "01",
      title: "National",
      blurb:
        "The whole of Speak Up Gen. Sets direction, brand, and overall standards. Oversees every state.",
      bg: C.leafDeep,
      fg: C.white,
      accent: C.lime,
    },
    {
      n: "02",
      title: "State",
      blurb:
        "One state chapter (for example Maharashtra or Rajasthan). Supports cities and keeps activity healthy across the state.",
      bg: C.leaf,
      fg: C.white,
      accent: C.lime,
    },
    {
      n: "03",
      title: "City",
      blurb:
        "A city chapter (for example Mumbai or Jaipur). Helps form and support local teams nearby.",
      bg: C.sky,
      fg: C.ink,
      accent: C.leaf,
    },
    {
      n: "04",
      title: "Local team (Unit)",
      blurb:
        "Where members actually meet, plan, and take action. This is the home base for every volunteer.",
      bg: C.lime,
      fg: C.ink,
      accent: C.coral,
    },
  ];

  for (const level of levels) {
    card(doc, M.l, y, CONTENT_W, 78, level.bg);
    doc.rect(M.l, y, 6, 78).fill(level.accent);
    doc
      .fillColor(level.accent)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(level.n, M.l + 18, y + 14);
    doc
      .fillColor(level.fg)
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(level.title, M.l + 18, y + 28);
    doc
      .fillColor(level.fg)
      .font("Helvetica")
      .fontSize(9.5)
      .text(level.blurb, M.l + 18, y + 46, { width: CONTENT_W - 36, lineGap: 2 });
    y += 90;
  }
}

function drawPage3(doc) {
  drawPageBackground(doc);
  let y = M.t;

  y = sectionTitle(doc, y, "3. Local teams are flexible");
  y = bodyText(
    doc,
    y,
    "A local team does not have to be a college campus. Speak Up Gen welcomes many kinds of teams under a city — as long as they share our purpose.",
  );
  y = bodyText(doc, y, "Examples of local teams:", { bold: true, after: 8 });

  const kinds = [
    ["College / campus team", "Students organising from a college or university"],
    ["Community team", "Young people from a neighbourhood or locality"],
    ["Workplace team", "Young professionals acting together at work"],
    ["Club or interest group", "A club focused on environment, arts, awareness, etc."],
    ["Partner team", "A friendly group collaborating under Speak Up Gen"],
    ["Custom team", "Any other genuine youth team that fits our mission"],
  ];

  for (const [title, desc] of kinds) {
    card(doc, M.l, y, CONTENT_W, 44, C.white);
    doc
      .fillColor(C.leaf)
      .font("Helvetica-Bold")
      .fontSize(10.5)
      .text(title, M.l + 14, y + 10);
    doc
      .fillColor(C.soft)
      .font("Helvetica")
      .fontSize(9)
      .text(desc, M.l + 14, y + 26, { width: CONTENT_W - 28 });
    y += 52;
  }

  y += 6;
  card(doc, M.l, y, CONTENT_W, 72, C.paper2);
  doc
    .fillColor(C.coral)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Important", M.l + 16, y + 14);
  doc
    .fillColor(C.ink)
    .font("Helvetica")
    .fontSize(10)
    .text(
      "New team types can be added later without redesigning the whole organisation. The structure stays the same — only the labels of local teams stay flexible.",
      M.l + 16,
      y + 32,
      { width: CONTENT_W - 32, lineGap: 2 },
    );

  y += 92;
  y = sectionTitle(doc, y, "4. A simple picture");
  y = bodyText(
    doc,
    y,
    "Here is one example of how the tree might look in real life:",
    { after: 12 },
  );

  // Hierarchy visual
  const box = (label, sub, bx, by, bw, fill) => {
    doc.roundedRect(bx, by, bw, 36, 6).fill(fill);
    doc.roundedRect(bx, by, bw, 36, 6).lineWidth(1).strokeColor(C.ink).stroke();
    doc
      .fillColor(C.ink)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(label, bx, by + 7, { width: bw, align: "center" });
    doc
      .fillColor(C.soft)
      .font("Helvetica")
      .fontSize(7.5)
      .text(sub, bx, by + 20, { width: bw, align: "center" });
  };

  const cx = PAGE.w / 2;
  box("Speak Up Gen National", "Whole organisation", cx - 95, y, 190, C.lime);
  // lines
  const line = (x1, y1, x2, y2) => {
    doc
      .moveTo(x1, y1)
      .lineTo(x2, y2)
      .strokeColor(C.ink)
      .lineWidth(1)
      .stroke();
  };
  line(cx, y + 36, cx, y + 52);
  box("Maharashtra (State)", "State chapter", cx - 85, y + 52, 170, C.sky);
  line(cx, y + 88, cx, y + 104);
  box("Mumbai (City)", "City chapter", cx - 75, y + 104, 150, C.paper2);
  line(cx, y + 140, cx - 120, y + 156);
  line(cx, y + 140, cx, y + 156);
  line(cx, y + 140, cx + 120, y + 156);
  box("XYZ College", "Campus team", cx - 175, y + 156, 110, C.white);
  box("Andheri Community", "Community team", cx - 55, y + 156, 110, C.white);
  box("Workplace Team", "Office team", cx + 65, y + 156, 110, C.white);
}

function drawPage4(doc) {
  drawPageBackground(doc);
  let y = M.t;

  y = sectionTitle(doc, y, "5. How someone joins");
  y = bodyText(
    doc,
    y,
    "Anyone who wants to be part of Speak Up Gen can apply. The process is designed to feel open — and still organised.",
    { after: 12 },
  );

  const steps = [
    {
      n: "1",
      t: "Apply",
      d: "The person fills a simple application: who they are, where they are, which local team they want to join, and why they care.",
    },
    {
      n: "2",
      t: "Local review",
      d: "The application goes to the local team lead — the people who know that team best.",
    },
    {
      n: "3",
      t: "Approve or decline",
      d: "The local lead accepts or declines. Higher leadership does not need to approve every single member.",
    },
    {
      n: "4",
      t: "Welcome + ID card",
      d: "If accepted, the person becomes an official member and can receive a Speak Up Gen member ID card.",
    },
  ];

  for (const s of steps) {
    doc.circle(M.l + 14, y + 16, 12).fill(C.leaf);
    doc
      .fillColor(C.lime)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(s.n, M.l + 14 - 4, y + 10, { width: 12, align: "center" });
    doc
      .fillColor(C.ink)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(s.t, M.l + 36, y + 6);
    doc
      .fillColor(C.soft)
      .font("Helvetica")
      .fontSize(10)
      .text(s.d, M.l + 36, y + 24, { width: CONTENT_W - 36, lineGap: 2 });
    y = doc.y + 16;
  }

  y += 6;
  card(doc, M.l, y, CONTENT_W, 64, C.lime);
  doc
    .fillColor(C.ink)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("Who decides?", M.l + 16, y + 14);
  doc
    .fillColor(C.ink)
    .font("Helvetica")
    .fontSize(10)
    .text(
      "Local leads approve their own applicants. This keeps decisions close to the ground, faster, and fairer — while national and state leaders still guide the bigger picture.",
      M.l + 16,
      y + 32,
      { width: CONTENT_W - 32, lineGap: 2 },
    );

  y += 84;
  y = sectionTitle(doc, y, "6. Member ID cards");
  y = bodyText(
    doc,
    y,
    "Every approved member can get an official Speak Up Gen ID card. This is not just a fancy badge — it creates trust and identity.",
  );
  y = bodyText(doc, y, "An ID card typically shows:", { bold: true, after: 6 });
  y = bullet(doc, y, "Member’s name and photo");
  y = bullet(doc, y, "Unique member ID number");
  y = bullet(doc, y, "Local team, city, and state");
  y = bullet(doc, y, "Role (for example Member or Team Lead)");
  y = bullet(doc, y, "A QR code so anyone can quickly check if the card is genuine");
  y = bodyText(
    doc,
    y + 4,
    "Cards can be downloaded digitally and printed when needed — useful for events, drives, partnerships, and campus recognition.",
  );
}

function drawPage5(doc) {
  drawPageBackground(doc);
  let y = M.t;

  y = sectionTitle(doc, y, "7. Who does what");
  y = bodyText(
    doc,
    y,
    "Titles can grow with the organisation. The responsibilities below are the practical ones that matter day to day.",
    { after: 12 },
  );

  const roles = [
    ["National leadership", "Vision, brand, standards, major decisions, support for states"],
    ["State lead", "Grow and support cities in the state; keep quality consistent"],
    ["City lead", "Help form local teams; support unit leads; keep city activity alive"],
    ["Local team lead", "Approve members, run team activity, issue / request ID cards"],
    ["Member", "Show up, take part, represent Speak Up Gen with care"],
  ];

  // Table header
  doc.rect(M.l, y, CONTENT_W, 28).fill(C.leafDeep);
  doc
    .fillColor(C.lime)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("ROLE", M.l + 12, y + 10);
  doc.text("FOCUS", M.l + 150, y + 10);
  y += 28;

  roles.forEach((row, i) => {
    const bg = i % 2 === 0 ? C.white : C.paper2;
    doc.rect(M.l, y, CONTENT_W, 36).fill(bg);
    doc
      .fillColor(C.ink)
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .text(row[0], M.l + 12, y + 12, { width: 130 });
    doc
      .fillColor(C.soft)
      .font("Helvetica")
      .fontSize(9)
      .text(row[1], M.l + 150, y + 12, { width: CONTENT_W - 162 });
    y += 36;
  });
  doc
    .rect(M.l, y - roles.length * 36 - 28, CONTENT_W, roles.length * 36 + 28)
    .lineWidth(1)
    .strokeColor(C.ink)
    .stroke();

  y += 20;
  y = sectionTitle(doc, y, "8. Why this structure helps");
  y = bullet(doc, y, "Clarity — everyone knows where they belong.");
  y = bullet(doc, y, "Scale — we can grow city by city without losing control.");
  y = bullet(doc, y, "Flexibility — local teams are not locked to colleges only.");
  y = bullet(doc, y, "Speed — local leads approve members without national bottlenecks.");
  y = bullet(doc, y, "Trust — ID cards make membership real and verifiable.");
  y = bullet(
    doc,
    y,
    "Unity — one Speak Up Gen identity, from national leadership to the newest volunteer.",
  );

  y += 16;
  y = sectionTitle(doc, y, "9. Closing note");
  y = bodyText(
    doc,
    y,
    "This document explains the organisation design in plain language. The technology that powers applications, approvals, and ID cards will follow this same structure — so what leaders understand on paper is what the system will support in practice.",
  );
  y = bodyText(
    doc,
    y,
    "If anything needs adjusting — for example team types, approval rules, or ID card details — it is easier to refine now, before building begins.",
  );

  y += 10;
  card(doc, M.l, y, CONTENT_W, 100, C.leafDeep);
  doc
    .fillColor(C.lime)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("Speak Up Gen", M.l + 20, y + 22);
  doc
    .fillColor(C.white)
    .font("Helvetica")
    .fontSize(10)
    .text("Speak today. Shape the way.", M.l + 20, y + 42);
  doc
    .fillColor(C.sky)
    .font("Helvetica")
    .fontSize(9)
    .text(
      "Prepared as a non-technical client explainer for organisational hierarchy & membership.\nQuestions welcome before implementation.",
      M.l + 20,
      y + 62,
      { width: CONTENT_W - 40, lineGap: 2 },
    );
}

async function main() {
  await mkdir(dirname(OUT), { recursive: true });

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    info: {
      Title: "Speak Up Gen — Organisation Hierarchy Explainer",
      Author: "Speak Up Gen",
      Subject: "Non-technical guide to organisational structure, membership, and ID cards",
      Keywords: "Speak Up Gen, hierarchy, membership, NGO, India",
    },
  });

  const stream = createWriteStream(OUT);
  doc.pipe(stream);

  const total = 5;
  drawCover(doc);
  // cover has no standard footer number style — add light footer
  doc
    .fillColor(C.soft)
    .font("Helvetica")
    .fontSize(8)
    .text("1 / 5", M.l, PAGE.h - 36, { width: CONTENT_W, align: "right" });

  doc.addPage();
  drawPage2(doc);
  footer(doc, 2, total);

  doc.addPage();
  drawPage3(doc);
  footer(doc, 3, total);

  doc.addPage();
  drawPage4(doc);
  footer(doc, 4, total);

  doc.addPage();
  drawPage5(doc);
  footer(doc, 5, total);

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  console.log(`Wrote ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
