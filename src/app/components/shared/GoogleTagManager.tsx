'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export const GoogleTagManager = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Reconstruct the full URL path (including query parameters if they exist)
  const fullPath = `${pathname}${
    searchParams && Array.from(searchParams.entries()).length > 0
      ? `?${searchParams.toString()}`
      : ''
  }`;

  useEffect(() => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'pageview',
        page: fullPath,
      });
    }
  }, [fullPath]);

  return null;
};
