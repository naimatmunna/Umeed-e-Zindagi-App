import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = path.resolve(__dirname, '../assets/fonts');

const FONT_URLS = {
  'NotoSans-Regular.ttf':
    'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf',
  'NotoSans-Bold.ttf':
    'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf',
  'NotoSansArabic-Regular.ttf':
    'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansArabic/NotoSansArabic-Regular.ttf',
  'NotoSansArabic-Bold.ttf':
    'https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansArabic/NotoSansArabic-Bold.ttf',
};

const ensureFonts = async () => {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
  for (const [file, url] of Object.entries(FONT_URLS)) {
    const dest = path.join(FONTS_DIR, file);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) continue;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download ${file}: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
    console.log(`Downloaded ${file}`);
  }
};

ensureFonts().catch((err) => {
  console.error(err);
  process.exit(1);
});
