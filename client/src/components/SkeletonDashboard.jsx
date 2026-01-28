import React from "react";
import SkeletonCard from "./SkeletonCard";

const SkeletonDashboard = () => {
  return (
    <div className="mb-8 md:mb-10 space-y-6 animate-pulse">
      {/* Bento Grid - Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {/* Main Card - Total Budget (Spans 2 columns on desktop) */}
        <div className="md:col-span-2">
          <SkeletonCard height="h-48 md:h-56" />
        </div>

        {/* Secondary Cards - Distributed & Balance */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-5">
          <SkeletonCard height="h-32 md:h-24" />
          <SkeletonCard height="h-32 md:h-24" />
        </div>
      </div>

      {/* Cash Notes Breakdown Skeleton */}
      <div className="glass-premium rounded-3xl p-6 md:p-7 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonCard height="h-10" className="w-10 rounded-xl" />
            <div className="space-y-2">
              <SkeletonCard height="h-4" className="w-40 rounded-full" />
              <SkeletonCard height="h-3" className="w-32 rounded-full" />
            </div>
          </div>
          <SkeletonCard
            height="h-6"
            className="w-24 rounded-full hidden md:block"
          />
        </div>

        {/* Cash Notes Grid Skeleton */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
          {[...Array(6)].map((_, idx) => (
            <SkeletonCard key={idx} height="h-32" rounded="rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonDashboard;
