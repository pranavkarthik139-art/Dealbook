import type { Metadata } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

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
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
