import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UHASMART | University Campus Marketplace (Ho, Ghana)",
  description: "The trusted student marketplace for University of Health and Allied Sciences (UHAS) in Ho, Ghana. Buy, sell, and discover student products and services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
