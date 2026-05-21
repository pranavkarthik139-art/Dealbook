import type { Metadata } from "next";

// Don't pre-render auth pages - render on demand
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Sign In - Dealbook",
  description: "Sign in to Dealbook",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
