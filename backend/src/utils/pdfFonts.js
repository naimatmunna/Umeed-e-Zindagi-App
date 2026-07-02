import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = path.resolve(__dirname, '../../assets/fonts');

const FONT_FILES = {
  notoSans: 'NotoSans-Regular.ttf',
  notoSansBold: 'NotoSans-Bold.ttf',
  /** Noto Sans Arabic — reliable Urdu shaping in PDFKit (Nastaliq GPOS breaks on some words). */
  notoUrdu: 'NotoSansArabic-Regular.ttf',
  notoUrduBold: 'NotoSansArabic-Bold.ttf',
};

export const hasUrduFonts = () =>
  Object.values(FONT_FILES).every((f) => fs.existsSync(path.join(FONTS_DIR, f)));

/** Register Noto Sans (EN) + Noto Sans Arabic (Urdu) on a PDFKit document instance. */
export const registerPdfFonts = (doc) => {
  if (!hasUrduFonts()) return;
  doc.registerFont('NotoSans', path.join(FONTS_DIR, FONT_FILES.notoSans));
  doc.registerFont('NotoSans-Bold', path.join(FONTS_DIR, FONT_FILES.notoSansBold));
  doc.registerFont('NotoUrdu', path.join(FONTS_DIR, FONT_FILES.notoUrdu));
  doc.registerFont('NotoUrdu-Bold', path.join(FONTS_DIR, FONT_FILES.notoUrduBold));
};

const ARABIC_SCRIPT = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export const containsUrduArabic = (text) => ARABIC_SCRIPT.test(String(text ?? ''));

const isArabicChar = (ch) => ARABIC_SCRIPT.test(ch);

/** Pick font by script content — Latin uses Noto Sans, Urdu/Arabic uses Noto Sans Arabic. */
export const pickBodyFont = (_lang, text = '') => {
  if (!hasUrduFonts()) return 'Helvetica';
  if (containsUrduArabic(text)) return 'NotoUrdu';
  return 'NotoSans';
};

export const pickBoldFont = (_lang, text = '') => {
  if (!hasUrduFonts()) return 'Helvetica-Bold';
  if (containsUrduArabic(text)) return 'NotoUrdu-Bold';
  return 'NotoSans-Bold';
};

export const pickLabelFont = (lang, text = '') => pickBodyFont(lang, text);

const fontForRun = (arabic, bold) => {
  if (arabic) return bold ? 'NotoUrdu-Bold' : 'NotoUrdu';
  return bold ? 'NotoSans-Bold' : 'NotoSans';
};

const splitScriptRuns = (text) => {
  const str = String(text ?? '');
  const runs = [];
  let i = 0;
  while (i < str.length) {
    const ch = str[i];
    if (ch === '\n') {
      runs.push({ text: '\n', arabic: null, break: true });
      i += 1;
      continue;
    }
    const arabic = isArabicChar(ch);
    let j = i + 1;
    while (j < str.length && str[j] !== '\n' && isArabicChar(str[j]) === arabic) j += 1;
    runs.push({ text: str.slice(i, j), arabic, break: false });
    i = j;
  }
  return runs;
};

const measureRun = (doc, run, bold) => {
  if (run.break) return { width: 0, height: 0 };
  doc.font(fontForRun(run.arabic, bold));
  return {
    width: doc.widthOfString(run.text),
    height: doc.currentLineHeight(),
  };
};

const measureLine = (doc, runs, bold) =>
  runs.reduce(
    (acc, run) => {
      if (run.break) return acc;
      const m = measureRun(doc, run, bold);
      return { width: acc.width + m.width, height: Math.max(acc.height, m.height) };
    },
    { width: 0, height: 0 },
  );

/** Render mixed Urdu/Latin with per-script fonts and manual positioning. */
export const writeScriptAwareText = (doc, text, options = {}) => {
  const { x, y, width, align = 'left', lineGap = 0, fontSize, fillColor, bold = false } = options;
  const str = String(text ?? '');

  if (fontSize) doc.fontSize(fontSize);
  if (fillColor) doc.fillColor(fillColor);

  if (!hasUrduFonts() || !containsUrduArabic(str)) {
    doc.font(bold ? pickBoldFont('en', str) : pickBodyFont('en', str));
    doc.text(str, x, y, { width, align, lineGap });
    return;
  }

  const runs = splitScriptRuns(str);
  const lines = [];
  let current = [];
  runs.forEach((run) => {
    if (run.break) {
      lines.push(current);
      current = [];
      return;
    }
    current.push(run);
  });
  if (current.length) lines.push(current);

  let cursorY = y;
  lines.forEach((lineRuns) => {
    const { width: lineW, height: lineH } = measureLine(doc, lineRuns, bold);
    let cursorX = x;
    if (align === 'center' && width) cursorX = x + Math.max(0, (width - lineW) / 2);
    if (align === 'right' && width) cursorX = x + Math.max(0, width - lineW);

    lineRuns.forEach((run) => {
      doc.font(fontForRun(run.arabic, bold));
      doc.text(run.text, cursorX, cursorY, { lineBreak: false });
      cursorX += doc.widthOfString(run.text);
    });

    cursorY += lineH + lineGap;
  });
};
