"use client";
import React, { useEffect, useState } from "react";

const API = "/api/brochure-packages";
const TEMPLATE = "/packages-brochure-template.pdf";
const INITIAL = [
  { id: 1, name: "Full Wedding Planning", price: "", offer: "", description: "" },
  { id: 2, name: "Partial Wedding Planning", price: "", offer: "", description: "" },
  { id: 3, name: "Wedding Day Coordination", price: "", offer: "", description: "" },
  { id: 4, name: "Wedding Agenda Making", price: "", offer: "", description: "" },
];

function wrapText(text, font, size, maxWidth) {
  const lines = [];
  for (const paragraph of String(text || "").split(/\r?\n/)) {
    if (!paragraph.trim()) { lines.push(""); continue; }
    let current = "";
    for (const word of paragraph.split(/\s+/)) {
      const next = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) {
        current = next;
      } else {
        if (current) lines.push(current);
        // Split unusually long words to keep all content inside the box.
        let part = "";
        for (const char of word) {
          if (font.widthOfTextAtSize(part + char, size) > maxWidth && part) {
            lines.push(part); part = char;
          } else part += char;
        }
        current = part;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function investmentLabel(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const number = raw.replace(/^(?:investment\s*[-:]?\s*)?(?:lkr|rs\.?|රු\.?)\s*/i, "").replace(/,/g, "").trim();
  if (/^\d+(?:\.\d{1,2})?$/.test(number)) {
    return `Investment - LKR ${Number(number).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  }
  return /^investment\b/i.test(raw) ? raw : `Investment - ${raw}`;
}

async function createPdf(packages) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const response = await fetch(TEMPLATE, { cache: "no-store" });
  if (!response.ok) throw new Error("PDF template not found in public folder.");
  const pdf = await PDFDocument.load(await response.arrayBuffer());
  if (pdf.getPageCount() !== 2) throw new Error("Expected a two-page brochure template.");

  const page = pdf.getPage(1);
  const { width, height } = page.getSize();
  const regular = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const ink = rgb(0.32, 0.25, 0.20);

  // These match the four existing boxes on page 2 of the Canva PDF.
  const rectangles = [
    { x: 487, top: 113, w: 290, h: 98 },
    { x: 487, top: 225, w: 290, h: 110 },
    { x: 487, top: 349, w: 290, h: 107 },
    { x: 487, top: 470, w: 290, h: 99 },
  ];

  const drawCentered = (line, font, size, boxX, boxWidth, baseline) => {
    if (!line) return;
    const lineWidth = font.widthOfTextAtSize(line, size);
    page.drawText(line, {
      x: boxX + (boxWidth - lineWidth) / 2,
      y: baseline,
      font,
      size,
      color: ink,
    });
  };

  for (let i = 0; i < 4; i++) {
    const p = packages[i];
    const r = rectangles[i];
    const x = (r.x * width) / 842.25;
    const top = (r.top * height) / 595.5;
    const w = (r.w * width) / 842.25;
    const h = (r.h * height) / 595.5;
    const bottom = height - top - h;
    const maxWidth = w - 30;

    const title = String(p.name || "").trim();
    const description = String(p.description || "").trim();
    const offer = String(p.offer || "").trim();
    const investment = investmentLabel(p.price);

    // Consistent typography across all four package boxes.
    // Only description/offer text may shrink for unusually long content.
    const titleSize = 16;
    const priceSize = 13;
    const gapTitle = 4;
    const gapPrice = 8;
    const minTopPadding = 10;
    const minBottomPadding = 12;
    const titleLines = wrapText(title, bold, titleSize, maxWidth);
    const priceLines = investment ? wrapText(investment, bold, priceSize, maxWidth) : [];
    const titleHeight = titleLines.length * titleSize * 1.08;
    const priceHeight = priceLines.length * priceSize * 1.08;

    let fitted = null;
    for (let bodySize = 11.7; bodySize >= 9.5; bodySize -= 0.2) {
      const offerSize = Math.min(bodySize, 10);
      const descriptionLines = description
        ? wrapText(description, regular, bodySize, maxWidth)
        : [];
      const offerLines = offer
        ? wrapText(offer, regular, offerSize, maxWidth)
        : [];
      const bodyHeight = descriptionLines.length * bodySize * 1.12;
      const offerHeight = offerLines.length * offerSize * 1.1;
      const gapOffer = offerLines.length ? 3 : 0;
      const total = titleHeight + (descriptionLines.length ? gapTitle : 0)
        + bodyHeight + gapOffer + offerHeight
        + (priceLines.length ? gapPrice : 0) + priceHeight;
      if (total <= h - minTopPadding - minBottomPadding) {
        fitted = { bodySize, offerSize, descriptionLines, offerLines,
          gapOffer, total };
        break;
      }
    }
    if (!fitted) {
      throw new Error(`Package ${i + 1} has too much text for the brochure box. Shorten its description or special offer.`);
    }

    // Center the complete text block vertically, without touching the border.
    let cursor = bottom + (h + fitted.total) / 2 + 8;
    for (const line of titleLines) {
      cursor -= titleSize * 1.08;
      drawCentered(line, bold, titleSize, x, w, cursor);
    }
    if (fitted.descriptionLines.length) cursor -= gapTitle;
    for (const line of fitted.descriptionLines) {
      cursor -= fitted.bodySize * 1.12;
      drawCentered(line, regular, fitted.bodySize, x, w, cursor);
    }
    cursor -= fitted.gapOffer;
    for (const line of fitted.offerLines) {
      cursor -= fitted.offerSize * 1.1;
      drawCentered(line, regular, fitted.offerSize, x, w, cursor);
    }
    if (priceLines.length) cursor -= gapPrice;
    for (const line of priceLines) {
      cursor -= priceSize * 1.08;
      drawCentered(line, bold, priceSize, x, w, cursor);
    }
  }
  return await pdf.save();
}

export default function PackagesManager() {
  const [packages, setPackages] = useState(INITIAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(API, { credentials: "same-origin", cache: "no-store" });
        if (!res.ok) throw new Error(`Unable to load packages (HTTP ${res.status}).`);
        const data = await res.json();
        if (!cancelled && Array.isArray(data.packages) && data.packages.length === 4) {
          setPackages(data.packages);
        }
      } catch (e) {
        if (!cancelled) { setMessage(e.message); setError(true); }
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const edit = (index, key, value) => {
    setPackages(prev => prev.map((p, i) => i === index ? { ...p, [key]: value } : p));
    setDirty(true);
    setMessage("");
  };

  const save = async () => {
    setSaving(true); setMessage("");
    try {
      const res = await fetch(API, {
        method: "PUT", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packages }),
      });
      if (!res.ok) throw new Error(`Save failed (HTTP ${res.status}).`);
      setDirty(false); setError(false); setMessage("All four packages saved successfully.");
    } catch (e) { setError(true); setMessage(e.message); }
    finally { setSaving(false); }
  };

  const download = async () => {
    setDownloading(true); setMessage("");
    try {
      const bytes = await createPdf(packages);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "Chathu-Wedding-Packages.pdf";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      setError(false);
      setMessage(dirty ? "PDF downloaded with your current edits. Remember to save changes to Turso." : "Brochure PDF downloaded.");
    } catch (e) { setError(true); setMessage(e.message); }
    finally { setDownloading(false); }
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-fuchsia-950">Our Packages</h1>
          <p className="text-sm text-gray-500 mt-1">Edit four packages, save to Turso, and generate your Canva-style brochure.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={loading || saving} onClick={save} className="rounded-xl bg-fuchsia-800 px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? "Saving..." : "Save Packages"}</button>
          <button type="button" disabled={loading || downloading} onClick={download} className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white disabled:opacity-50">{downloading ? "Generating..." : "Download PDF"}</button>
        </div>
      </div>
      {message && <p role="status" className={`rounded-xl p-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>{message}</p>}
      {dirty && <p className="text-sm font-semibold text-amber-700">You have unsaved changes.</p>}
      {loading ? <p className="p-6">Loading packages...</p> : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {packages.map((p, index) => (
            <section key={p.id} className="rounded-3xl border border-gray-100 bg-white/90 p-5 shadow-sm space-y-3">
              <h2 className="text-lg font-black text-fuchsia-950">Package {index + 1}</h2>
              {[
                ["name", "Package Name", 80],
                ["price", "Price (e.g. LKR 350,000)", 40],
                ["offer", "Special Offer / Discount (optional)", 70],
              ].map(([field, label, limit]) => (
                <label key={field} className="block text-sm font-semibold text-gray-700">
                  {label}
                  <input type="text" maxLength={limit} value={p[field]} onChange={e => edit(index, field, e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 p-3 font-normal outline-none focus:ring-2 focus:ring-fuchsia-200" />
                </label>
              ))}
              <label className="block text-sm font-semibold text-gray-700">
                Description / Included Services
                <textarea rows={4} maxLength={450} value={p.description} onChange={e => edit(index, "description", e.target.value)} placeholder="Enter short package details (one item per line, if preferred)" className="mt-1 w-full rounded-xl border border-gray-200 p-3 font-normal outline-none focus:ring-2 focus:ring-fuchsia-200" />
              </label>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
