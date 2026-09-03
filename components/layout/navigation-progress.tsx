"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * NavigationProgress — thin accent-colored bar at the top of the page
 * that animates on every pathname change (Next.js App Router navigations).
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Clean previous timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Start: show bar and animate to 85%
    setVisible(true);
    setProgress(15);

    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 85) {
          clearInterval(intervalRef.current!);
          return 85;
        }
        // Easing: advance slower as we approach 85%
        return p + Math.random() * (90 - p) * 0.06;
      });
    }, 100);

    // Complete: jump to 100% then hide
    timerRef.current = setTimeout(() => {
      clearInterval(intervalRef.current!);
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    }, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
     
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[2px] bg-accent transition-all"
      style={{
        width: `${progress}%`,
        transitionDuration: progress === 100 ? "200ms" : "100ms",
        transitionTimingFunction: "ease-out",
        boxShadow: "0 0 8px rgba(201, 242, 102, 0.7)",
      }}
    />
  );
}
