"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

import type { Locale } from "@/i18n/locales";

export function useLocalizedRouter() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigate(path: string, newLocale?: Locale) {
    const targetLocale = newLocale || locale;
    const pathWithLocale = `/${targetLocale}${path}`;
    startTransition(() => {
      router.push(pathWithLocale);
    });
  }

  function switchLocale(newLocale: Locale) {
    const currentPath = window.location.pathname;
    const pathWithoutLocale = currentPath.replace(
      /^\/(en|es|fr|de|it|pt|ja|ko|zh)/,
      "",
    );
    const newPath = `/${newLocale}${pathWithoutLocale || "/"}`;
    startTransition(() => {
      router.push(newPath);
    });
  }

  return {
    navigate,
    switchLocale,
    isPending,
    currentLocale: locale,
  };
}
