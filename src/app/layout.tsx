import type { Metadata } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import { LanguageProvider } from "@/context/LanguageProvider";
import ConditionalLanguageSelector from "@/components/ConditionalLanguageSelector";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Principal font - DM Sans
const dmSans = localFont({
  src: [
    {
      path: "../../public/fonts/static/DMSans-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/fonts/static/DMSans-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/static/DMSans-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/static/DMSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/static/DMSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/static/DMSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/static/DMSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/static/DMSans-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/static/DMSans-Black.ttf",
      weight: "900",
      style: "normal",
    },
    // Italic variants
    {
      path: "../../public/fonts/static/DMSans-ThinItalic.ttf",
      weight: "100",
      style: "italic",
    },
    {
      path: "../../public/fonts/static/DMSans-ExtraLightItalic.ttf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../../public/fonts/static/DMSans-LightItalic.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/static/DMSans-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/static/DMSans-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/static/DMSans-SemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../public/fonts/static/DMSans-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/static/DMSans-ExtraBoldItalic.ttf",
      weight: "800",
      style: "italic",
    },
    {
      path: "../../public/fonts/static/DMSans-BlackItalic.ttf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-dm-sans",
  display: "swap",
});

// Brand font - Distro Bold for "Juno" logo
const distroBold = localFont({
  src: "../../public/fonts/DISTROB_.ttf",
  variable: "--font-distro-bold",
  display: "swap",
});

// Cursive font - PPEditorialNew
const ppEditorialNew = localFont({
  src: "../../public/fonts/PPEditorialNew-Regular-BF644b214ff145f.otf",
  variable: "--font-cursive",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Juno Performance Studio | Portal Access",
  description: "Welcome to the Juno Performance Studio portal. Secure access for clients and admins to manage proposals, campaigns, meetings, and performance analytics for fashion, beauty, wellness, and tourism eCommerce brands.",
  icons: {
    icon: "/resources/favicons/favicon.ico",
  },
  openGraph: {
    title: "Juno Performance Studio | Portal Access",
    description: "Boutique Studio for eCommerce brands. Secure portal for proposals, campaigns, and analytics.",
    url: "https://staging.portal.junoperformancestudio.com",
    type: "website",
    images: [
      {
        url: "/resources/favicons/isologos.png",
        width: 512,
        height: 512,
        alt: "Juno Performance Studio Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Juno Performance Studio | Portal Access",
    description: "Boutique Studio for eCommerce brands. Secure portal for proposals, campaigns, and analytics.",
    images: [
      "/resources/favicons/isologos.png",
    ],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${distroBold.variable} ${ppEditorialNew.variable} 
      font-dm-sans 
      tracking-tight 
      antialiased`}>
        <LanguageProvider>
          <ConditionalLanguageSelector />
          <Suspense>
            {children}
          </Suspense>
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  );
}