import { getAccessToken } from '@/lib/token.js';
import { config } from '@/config/env.js';

/**
 * Download expense report PDF from the streaming export endpoint.
 */
export async function downloadExpenseReportPdf({ month, categoryId, userId } = {}) {
  const params = new URLSearchParams();
  if (month) params.set('month', month);
  if (categoryId) params.set('categoryId', categoryId);
  if (userId) params.set('userId', userId);

  const url = `${config.apiBaseUrl}/expenses/export/pdf?${params.toString()}`;
  const token = getAccessToken();

  const response = await fetch(url, {
    method: 'GET',
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
    `expense-report-${month ?? 'export'}.pdf`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}
