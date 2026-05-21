interface Deal {
  id: number;
  name: string;
  amount?: number;
  stage?: string;
  status?: string;
  lastActivityAt?: string | null;
  createdAt: string;
}

export function exportDealsToCSV(deals: Deal[], filename = 'deals.csv') {
  // Only run in browser environment
  if (typeof document === 'undefined') {
    console.warn('exportDealsToCSV: Not in a browser environment');
    return;
  }

  if (deals.length === 0) {
    alert('No deals to export');
    return;
  }

  // Create CSV header
  const headers = ['ID', 'Name', 'Amount', 'Stage', 'Status', 'Last Activity', 'Created Date'];

  // Create CSV rows
  const rows = deals.map((deal) => [
    deal.id,
    `"${deal.name}"`, // Wrap in quotes to handle commas
    deal.amount ? `$${deal.amount}` : '',
    deal.stage || '',
    deal.status || '',
    deal.lastActivityAt ? new Date(deal.lastActivityAt).toLocaleDateString() : 'Never',
    new Date(deal.createdAt).toLocaleDateString(),
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
