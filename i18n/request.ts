import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

import { defaultLocale, isValidLocale, locales, type Locale } from "./locales";

export { locales, defaultLocale, type Locale };

export default getRequestConfig(async () => {
  const headers = await import("next/headers").then((m) => m.headers());
  const requestLocale = headers.get("Next-Intl-Locale") || defaultLocale;

  const locale: Locale = isValidLocale(requestLocale)
    ? requestLocale
    : defaultLocale;

  if (!locales.includes(locale)) notFound();

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
