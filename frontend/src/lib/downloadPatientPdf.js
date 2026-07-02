import { getAccessToken } from '@/lib/token.js';
import { config } from '@/config/env.js';

export async function downloadPatientPdf({ patientId, lang = 'en', preview = false }) {
  const params = new URLSearchParams({ lang });
  const url = `${config.apiBaseUrl}/patients/${patientId}/export/pdf?${params}`;
  const token = getAccessToken();

  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'include',
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to export PDF');
  }

  const blob = await response.blob();
  const filename =
    response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] ??
    `admission-${patientId}-${lang}.pdf`;

  const blobUrl = URL.createObjectURL(blob);

  if (preview) {
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}

export function printPatientPdf({ patientId, lang = 'en' }) {
  return downloadPatientPdf({ patientId, lang, preview: true });
}
