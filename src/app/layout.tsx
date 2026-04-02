import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "GCG Deal Scout",
  description: "Interne Lead-Generierung für GCG Unternehmensberatung",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="bg-gray-50 min-h-full">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
