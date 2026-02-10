import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Bungee_Outline } from "next/font/google";

const bungeeOutline = Bungee_Outline({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-outline",
});


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const kontrabanda = localFont({
  src: "../public/fonts/Kontrabanda.ttf",
  variable: "--font-kontrabanda",
  display: "swap",
});

const miloner = localFont({
  src: "../public/fonts/MILONER-Medium.ttf",
  variable: "--font-miloner",
  display: "swap",
});

const monografitti = localFont({
  src: "../public/fonts/Monografitti.ttf",
  variable: "--font-monografitti",
  display: "swap",
});

const sefa = localFont({
  src: "../public/fonts/Sefa.otf",
  variable: "--font-sefa",
  display: "swap",
});

const thirstyCaps = localFont({
  src: "../public/fonts/ThirstyCaps.otf",
  variable: "--font-thirstycaps",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Male Straface",
  description: "Portfolio Malena Straface - Dancer & Model",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          kontrabanda.variable,
          miloner.variable,
          monografitti.variable,
          sefa.variable,
          thirstyCaps.variable,
          bungeeOutline.variable,
          "antialiased",
        ].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}
