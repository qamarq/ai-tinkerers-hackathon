"use client";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import type { Locale } from "@/i18n/locales";

export function LocaleLayout({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={getMessages()}>
      {children}
    </NextIntlClientProvider>
  );
}
