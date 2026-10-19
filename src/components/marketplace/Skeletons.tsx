import React from 'react';
import { Skeleton } from '../ui';

interface ListingCardSkeletonProps {
  layout?: 'grid' | 'list';
}

export const ListingCardSkeleton: React.FC<ListingCardSkeletonProps> = ({
  layout = 'grid'
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-[rgba(11,77,69,0.08)] shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden flex flex-1 w-full h-full ${
        layout === 'list' ? 'flex-col md:flex-row' : 'flex-col'
      }`}
    >
      {/* Image Skeleton */}
      <div className={`relative overflow-hidden ${layout === 'list' ? 'md:w-72 h-52 md:h-auto' : 'h-52'} bg-kawral-ivory flex-shrink-0 p-3`}>
        <Skeleton className="w-full h-full rounded-xl" />
        
        {/* Status Badge Placeholder */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <Skeleton className="w-16 h-5 rounded-[4px] bg-slate-300/80" />
          <Skeleton className="w-20 h-5 rounded-[4px] bg-amber-200/80" />
        </div>

        {/* Favorite Button Placeholder */}
        <div className="absolute top-3 right-3">
          <Skeleton className="w-8 h-8 rounded-full bg-slate-200" />
        </div>
      </div>

      {/* Body Content Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Category Tag */}
          <Skeleton className="w-24 h-3 rounded-md" />

          {/* Title Lines */}
          <Skeleton className="w-11/12 h-5 rounded-md" />
          <Skeleton className="w-3/4 h-5 rounded-md" />

          {/* Location */}
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="w-4 h-4 rounded-full" />
            <Skeleton className="w-36 h-3.5 rounded-md" />
          </div>

          {/* Characteristics Summary Badges */}
          <div className="flex items-center gap-2 pt-2">
            <Skeleton className="w-16 h-6 rounded-md" />
            <Skeleton className="w-14 h-6 rounded-md" />
            <Skeleton className="w-14 h-6 rounded-md" />
          </div>
        </div>

        {/* Footer Price Row */}
        <div className="flex items-center justify-between border-t border-[#F5F5F5] pt-3 mt-auto">
          <Skeleton className="w-28 h-6 rounded-md" />
          <Skeleton className="w-20 h-4 rounded-md" />
        </div>
      </div>
    </div>
  );
};

interface ListingGridSkeletonProps {
  count?: number;
  layout?: 'grid' | 'list';
  showControls?: boolean;
  mobileHorizontalScroll?: boolean;
}

export const ListingGridSkeleton: React.FC<ListingGridSkeletonProps> = ({
  count = 6,
  layout = 'grid',
  showControls = true,
  mobileHorizontalScroll = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Header & Controls Bar Skeleton */}
      {showControls && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-kawral-border">
          <div className="space-y-1.5">
            <Skeleton className="w-32 h-5 rounded-md" />
            <Skeleton className="w-28 h-3.5 rounded-md" />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <Skeleton className="w-32 h-8 rounded-xl" />
            <Skeleton className="w-20 h-8 rounded-xl" />
          </div>
        </div>
      )}

      {/* Grid or List Skeleton items */}
      <div
        className={
          layout === 'grid'
            ? mobileHorizontalScroll
              ? 'flex flex-nowrap items-stretch overflow-x-auto sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 pb-2.5 sm:pb-0 no-scrollbar w-full'
              : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6'
            : 'flex flex-col gap-4'
        }
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={
              mobileHorizontalScroll
                ? "w-[calc(50%-6px)] min-w-[calc(50%-6px)] max-w-[calc(50%-6px)] shrink-0 sm:w-auto sm:min-w-0 sm:max-w-none sm:shrink flex flex-col h-full self-stretch"
                : "flex flex-col h-full self-stretch"
            }
          >
            <ListingCardSkeleton layout={layout} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ListingDetailImageSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {/* Large Primary Image Skeleton */}
      <div className="relative h-[380px] sm:h-[480px] lg:h-[550px] rounded-3xl overflow-hidden bg-slate-100 border border-kawral-border p-4">
        <Skeleton className="w-full h-full rounded-2xl" />

        {/* Overlay Badges */}
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <Skeleton className="w-24 h-7 rounded-full" />
          <Skeleton className="w-28 h-7 rounded-full" />
        </div>

        {/* Counter Badge */}
        <div className="absolute bottom-6 right-6">
          <Skeleton className="w-24 h-7 rounded-full" />
        </div>
      </div>

      {/* Thumbnail Carousel Bar Skeleton */}
      <div className="flex items-center gap-3 overflow-hidden pb-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="w-24 h-20 rounded-2xl bg-white border border-kawral-border p-1.5 flex-shrink-0"
          >
            <Skeleton className="w-full h-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ListingDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-32">
      {/* Top Navigation Bar Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="w-48 h-5 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-24 h-9 rounded-xl" />
          <Skeleton className="w-24 h-9 rounded-xl" />
        </div>
      </div>

      {/* Main Image Gallery Skeleton */}
      <ListingDetailImageSkeleton />

      {/* Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Details Skeleton */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title & Location Box */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-kawral-border space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Skeleton className="w-32 h-6 rounded-md" />
              <Skeleton className="w-40 h-8 rounded-md" />
            </div>
            <Skeleton className="w-3/4 h-8 rounded-md" />
            <Skeleton className="w-1/2 h-5 rounded-md" />
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <Skeleton className="w-28 h-10 rounded-xl" />
              <Skeleton className="w-28 h-10 rounded-xl" />
              <Skeleton className="w-28 h-10 rounded-xl" />
            </div>
          </div>

          {/* Description Box */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-kawral-border space-y-3">
            <Skeleton className="w-36 h-6 rounded-md" />
            <Skeleton className="w-full h-4 rounded-md" />
            <Skeleton className="w-full h-4 rounded-md" />
            <Skeleton className="w-4/5 h-4 rounded-md" />
          </div>
        </div>

        {/* Right Col: Seller Card Skeleton */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-kawral-border space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-14 h-14 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="w-3/4 h-5 rounded-md" />
                <Skeleton className="w-1/2 h-3.5 rounded-md" />
              </div>
            </div>
            <Skeleton className="w-full h-11 rounded-xl" />
            <Skeleton className="w-full h-11 rounded-xl" />
            <Skeleton className="w-full h-11 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="w-64 h-8 rounded-md" />
        <Skeleton className="w-32 h-10 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-kawral-border space-y-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className="w-24 h-4 rounded-md" />
            <Skeleton className="w-32 h-8 rounded-md" />
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-3xl border border-kawral-border space-y-6 mt-8">
        <Skeleton className="w-48 h-6 rounded-md mb-4" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="w-32 h-4 rounded-md" />
                <Skeleton className="w-24 h-3 rounded-md" />
              </div>
            </div>
            <Skeleton className="w-24 h-8 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};
