'use client';

import { useParams } from 'next/navigation';
import { DealDetailView } from '@/components/deals/DealDetailView';

export default function DealDetailPage() {
  const params = useParams();
  const dealId = parseInt(params.id as string);

  return (
    <div className="px-8 py-8">
      <div className="max-w-full">
        <DealDetailView dealId={dealId} />
      </div>
    </div>
  );
}
