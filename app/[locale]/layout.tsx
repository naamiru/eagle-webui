import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ReloadDetector } from "@/components/ReloadDetector";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Eagle WebUI",
  description: "Web interface for Eagle image viewer",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <ReloadDetector />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
