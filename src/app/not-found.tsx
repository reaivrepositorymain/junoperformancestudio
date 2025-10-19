"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 flex flex-col items-center">
        {/* Broken Robot SVG */}
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mb-6" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="40" width="80" height="60" rx="16" fill="#E84912" />
          <rect x="40" y="20" width="40" height="30" rx="8" fill="#F6A100" />
          <circle cx="45" cy="70" r="8" fill="#fff" />
          <circle cx="75" cy="70" r="8" fill="#fff" />
          <circle cx="45" cy="70" r="3" fill="#E84912" />
          <circle cx="75" cy="70" r="3" fill="#E84912" />
          <rect x="55" y="90" width="10" height="8" rx="2" fill="#D7770F" />
          <rect x="30" y="100" width="10" height="8" rx="2" fill="#67ACAA" transform="rotate(-15 30 100)" />
          <rect x="80" y="100" width="10" height="8" rx="2" fill="#67ACAA" transform="rotate(15 80 100)" />
          <line x1="60" y1="20" x2="60" y2="10" stroke="#3669B2" strokeWidth="4" strokeLinecap="round" />
          <line x1="40" y1="35" x2="30" y2="25" stroke="#3669B2" strokeWidth="3" strokeLinecap="round" />
          <line x1="80" y1="35" x2="90" y2="25" stroke="#3669B2" strokeWidth="3" strokeLinecap="round" />
          {/* Crack */}
          <path d="M60 60 L65 65 L62 70" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <h1 className="text-3xl font-bold text-[#E84912] mb-2">404 - Page Not Found</h1>
        <p className="text-gray-700 text-center mb-6">
          Oops! The page you're looking for doesn't exist.<br />
          Our robot tried to find it, but it broke down!
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-black hover:bg-[#E84912] text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}