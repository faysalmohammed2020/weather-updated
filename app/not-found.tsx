'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NotFound() {
  const pathname = usePathname();

  // Safely extract locale or fallback to 'en'
  const segments = pathname?.split('/') || [];
  const locale = segments[1] || 'en';

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white dark:bg-gray-900 px-4 text-center">
      <img
        src="/image-404.png"
        alt="404 Illustration"
        className="w-full max-w-md mb-6"
      />
      <Link
        href={`/${locale}`}
        className="inline-block px-6 py-3 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition"
      >
        Back Previous Page
      </Link>
    </div>
  );
}
