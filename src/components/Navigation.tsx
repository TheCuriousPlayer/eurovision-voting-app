'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/eurovision2022', label: 'Eurovision 2022' },
  ];

  return (
    <nav className="bg-[#0f1123] shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-white font-bold text-xl flex items-center gap-2"
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="sr-only">Home</span>
            </Link>
            <a
              href="https://www.youtube.com/watch?v=TJOPmCHlNtk&list=PLvYQzibNzDx01WQHqmrIL-CXvrPHuDl4I"
              className="ml-30 px-3 py-2 bg-[#e53935] hover:bg-[#d32f2f] text-white rounded-md text-sm font-medium transition-colors"
              aria-label="Buğra Şişman - Youtube"
            >
              Buğra Şişman - Youtube
            </a>
          </div>
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-[#2c3e50] text-white'
                    : 'text-gray-300 hover:bg-[#2c3e50] hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
