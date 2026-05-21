import type { Metadata } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { Providers } from "./providers";

// Disable static pre-rendering for entire app
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Dealbook",
  description: "Professional deal pipeline & presales management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
