"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./ad-slot.module.css";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type BlogAdSlotProps = {
  clientId: string | null;
  slotId: string | null;
  title?: string;
  variant?: "inline" | "middle" | "footer";
};

export function BlogAdSlot({
  clientId,
  slotId,
  title = "Publicidade",
  variant = "inline",
}: BlogAdSlotProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const hasRequestedRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!clientId || !slotId) {
      return;
    }

    const node = frameRef.current;

    if (!node || typeof IntersectionObserver === "undefined") {
      const frame = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });

      return () => window.cancelAnimationFrame(frame);
    }

    if (isVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "280px 0px",
        threshold: 0.15,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [clientId, isVisible, slotId]);

  useEffect(() => {
    if (!clientId || !slotId || !isVisible || hasRequestedRef.current) {
      return;
    }

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      hasRequestedRef.current = true;
    } catch {
      hasRequestedRef.current = false;
    }
  }, [clientId, isVisible, slotId]);

  if (!clientId || !slotId) {
    return null;
  }

  return (
    <aside
      aria-label={title}
      className={styles.slot}
      data-variant={variant}
    >
      <span className={styles.label}>{title}</span>
      <div className={styles.frame} ref={frameRef}>
        {isVisible ? (
          <ins
            className={`adsbygoogle ${styles.ins}`}
            data-ad-client={clientId}
            data-ad-format="auto"
            data-ad-slot={slotId}
            data-full-width-responsive="true"
          />
        ) : (
          <div aria-hidden="true" className={styles.placeholder} />
        )}
      </div>
    </aside>
  );
}
