import type { Metadata } from "next";

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
