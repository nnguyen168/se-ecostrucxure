import React, { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the map component to avoid SSR issues
const FleetMap = lazy(() => import('./FleetMap').then(module => ({ default: module.FleetMap })));

interface FleetMapWrapperProps {
  turbines: any[];
}

export const FleetMapWrapper: React.FC<FleetMapWrapperProps> = ({ turbines }) => {
  return (
    <Suspense
      fallback={
        <div className="h-[450px] w-full rounded-xl overflow-hidden border border-gray-200">
          <Skeleton className="h-full w-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading map...</p>
            </div>
          </div>
        </div>
      }
    >
      <FleetMap turbines={turbines} />
    </Suspense>
  );
};