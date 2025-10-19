import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Compose - AI-Powered Email Platform",
  description: "Create, edit, and send professional emails with AI assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
