import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const BRAND = Object.freeze({
  name: 'Umeed-e-Zindagi Institute',
  tagline: 'Hope of Life',
  address: 'Near DHQ Hospital, Jhang, Punjab, Pakistan',
  phone: '+92 300 0000000',
  email: 'info@umeed-e-zindagi.org',
  softwareCredit: 'ZarCloud — Naimat Ullah',
  logoPath: path.resolve(__dirname, '../assets/logo.png'),
});
