"use client";

import dynamic from "next/dynamic";

const FridgePage = dynamic(
  () =>
    import("@/features/fridge/components/FridgePage").then(
      (module) => module.FridgePage,
    ),
  { ssr: false },
);

export default function FridgeRoute() {
  return <FridgePage />;
}
