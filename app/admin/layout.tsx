import React from "react";
import Script from "next/script";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Cloudinary Upload Widget */}
      <Script
        src="https://widget.cloudinary.com/v2.0/global/all.js"
        strategy="beforeInteractive"
      />

      <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
    </div>
  );
}
