"use client";

/**
 * PageSkeleton — displayed via loading.tsx during Server Component fetching.
 * Matches the structure of a typical dashboard page (header + cards).
 */
export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <div className="h-7 w-40 rounded-lg bg-bg-elev-2" />
        <div className="h-4 w-28 rounded-md bg-bg-elev" />
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-bg-elev border border-line" />
        ))}
      </div>

      {/* Main content block */}
      <div className="h-64 rounded-2xl bg-bg-elev border border-line" />

      {/* Secondary content block */}
      <div className="h-40 rounded-2xl bg-bg-elev border border-line" />
    </div>
  );
}
