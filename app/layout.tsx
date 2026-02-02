import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Counter-Offer Calculator",
  description: "Know exactly what to counter before you reply."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
