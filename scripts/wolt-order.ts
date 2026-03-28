import { config } from "dotenv";
import { orderGroceries } from "../features/food-ordering";

config();

function parseItems(): string[] {
  const args = process.argv.slice(2);
  const idx = args.indexOf("--items");
  if (idx !== -1 && args[idx + 1]) {
    return args[idx + 1].split(",").map((s) => s.trim()).filter(Boolean);
  }
  console.error("Podaj listę: --items 'mleko,chleb,masło'");
  process.exit(1);
}

const items = parseItems();
console.log(`\n=== Wolt Agent ===`);
console.log(`Produkty (${items.length}): ${items.join(", ")}\n`);

orderGroceries(items)
  .then((result) => {
    console.log(`\n${result.success ? "✓" : "✗"} ${result.summary}`);
  })
  .catch((err: unknown) => {
    console.error("Błąd:", err);
    process.exit(1);
  });
