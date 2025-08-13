import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eagle WebUI",
  description: "Web interface for Eagle image viewer",
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
