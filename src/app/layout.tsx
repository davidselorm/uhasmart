import type { Metadata, Viewport } from "next";
import MobileDock from "@/components/MobileDock";
import "./globals.css";

export const metadata: Metadata = {
  title: "UHASMART | University Campus Marketplace (Ho, Ghana)",
  description: "The trusted student marketplace for University of Health and Allied Sciences (UHAS) in Ho, Ghana. Buy, sell, and discover student products and services.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="relative min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-700">
        {/* Subtle Ambient Apple iOS Glows */}
        <div className="ambient-glow ambient-glow-blue -top-32 -left-32 h-96 w-96" />
        <div className="ambient-glow ambient-glow-purple top-1/3 -right-32 h-[30rem] w-[30rem]" />

        <div className="relative flex min-h-screen flex-col pb-20 md:pb-0">
          {children}
        </div>

        {/* Floating iOS Frosted Glass Mobile Dock */}
        <MobileDock />
      </body>
    </html>
  );
}
