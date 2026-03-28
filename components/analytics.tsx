import Script from "next/script";

export function Analytics() {
  return (
    <Script
      defer
      src="https://analytics.guzek.uk/script.js"
      data-website-id="1321da1a-c965-4adb-bcf9-6742efa38467"
      data-domains="gotownik.love"
    />
  );
}
