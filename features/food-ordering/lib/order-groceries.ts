import * as fs from "fs";
import * as path from "path";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, stepCountIs, tool } from "ai";
import { chromium, type Page } from "playwright";
import { z } from "zod";

function createBrowserTools(page: Page) {
  return {
    screenshot: tool({
      description:
        "Zrób screenshot + pobierz listę klikalnych elementów na stronie. Zawsze zacznij od screenshot żeby zobaczyć co jest na ekranie.",
      inputSchema: z.object({}),
      execute: async () => {
        const buf = await page.screenshot({ type: "jpeg", quality: 60 });

        const clickables = await page.evaluate(() => {
          const els = document.querySelectorAll(
            'a, button, input, [role="button"], [role="link"], [role="option"], [role="menuitem"], [data-test-id], [aria-label]',
          );
          const results: string[] = [];
          for (const el of Array.from(els)) {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) continue;
            if (rect.top > window.innerHeight || rect.bottom < 0) continue;

            const tag = el.tagName.toLowerCase();
            const text = (el.textContent ?? "").trim().slice(0, 60);
            const ariaLabel = el.getAttribute("aria-label") ?? "";
            const testId = el.getAttribute("data-test-id") ?? "";
            const role = el.getAttribute("role") ?? "";
            const x = Math.round(rect.x + rect.width / 2);
            const y = Math.round(rect.y + rect.height / 2);

            let selector = "";
            if (testId) selector = `[data-test-id="${testId}"]`;
            else if (ariaLabel) selector = `${tag}[aria-label="${ariaLabel}"]`;
            else if (el.id) selector = `#${el.id}`;

            results.push(
              `[${x},${y}] <${tag}>${role ? ` role=${role}` : ""}${selector ? ` sel="${selector}"` : ""} "${text}"${ariaLabel ? ` aria="${ariaLabel}"` : ""}`,
            );
          }
          return results.slice(0, 50).join("\n");
        });

        return { base64: buf.toString("base64"), clickables };
      },
      toModelOutput: async ({ output }) => ({
        type: "content" as const,
        value: [
          {
            type: "image-data" as const,
            data: output.base64,
            mediaType: "image/jpeg",
          },
          {
            type: "text" as const,
            text: `Klikalne elementy [x,y] na stronie:\n${output.clickables}`,
          },
        ],
      }),
    }),

    click: tool({
      description:
        "Kliknij element. Metody: 'text' (po widocznym tekście), 'css' (selektor CSS), 'role' (po roli ARIA).",
      inputSchema: z.object({
        selector: z
          .string()
          .describe("Tekst, selektor CSS, lub nazwa dla roli ARIA"),
        method: z
          .enum(["css", "text", "role"])
          .default("text")
          .describe(
            "'text' – po tekście, 'css' – selektor CSS, 'role' – po roli ARIA",
          ),
        role: z
          .enum(["button", "link", "menuitem", "option", "tab"])
          .optional()
          .describe("Rola ARIA (wymagana gdy method='role')"),
      }),
      execute: async (input: {
        selector: string;
        method: "css" | "text" | "role";
        role?: "button" | "link" | "menuitem" | "option" | "tab";
      }) => {
        try {
          if (input.method === "role" && input.role) {
            await page
              .getByRole(input.role, { name: input.selector })
              .first()
              .click({ timeout: 8000 });
          } else if (input.method === "text") {
            await page
              .getByText(input.selector, { exact: false })
              .first()
              .click({ timeout: 8000 });
          } else {
            await page.locator(input.selector).first().click({ timeout: 8000 });
          }
          await page.waitForLoadState("domcontentloaded");
          return `Kliknięto: ${input.selector}`;
        } catch (e) {
          return `Błąd kliknięcia "${input.selector}": ${(e as Error).message}`;
        }
      },
    }),

    getHTML: tool({
      description:
        "Pobierz fragment HTML strony – pomaga znaleźć poprawne selektory CSS.",
      inputSchema: z.object({
        selector: z.string().default("body").describe("Selektor CSS elementu"),
        maxLength: z
          .number()
          .default(3000)
          .describe("Max długość zwracanego HTML"),
      }),
      execute: async (input: { selector: string; maxLength: number }) => {
        try {
          const html = await page
            .locator(input.selector)
            .first()
            .innerHTML({ timeout: 5000 });
          return html.slice(0, input.maxLength);
        } catch (e) {
          return `Błąd: ${(e as Error).message}`;
        }
      },
    }),

    clickAt: tool({
      description: "Kliknij w podane współrzędne (x, y) na stronie.",
      inputSchema: z.object({
        x: z.number().describe("Pozycja X w pikselach"),
        y: z.number().describe("Pozycja Y w pikselach"),
      }),
      execute: async (input: { x: number; y: number }) => {
        await page.mouse.click(input.x, input.y);
        await page.waitForLoadState("domcontentloaded");
        return `Kliknięto w (${input.x}, ${input.y})`;
      },
    }),

    type: tool({
      description: "Wpisz tekst do wskazanego selektora lub aktywnego pola.",
      inputSchema: z.object({
        text: z.string().describe("Tekst do wpisania"),
        selector: z
          .string()
          .optional()
          .describe("Opcjonalny selektor CSS pola"),
        clearFirst: z
          .boolean()
          .default(true)
          .describe("Wyczyść pole przed wpisaniem"),
      }),
      execute: async (input: {
        text: string;
        selector?: string;
        clearFirst: boolean;
      }) => {
        try {
          if (input.selector) {
            const el = page.locator(input.selector).first();
            if (input.clearFirst) await el.fill(input.text);
            else await el.pressSequentially(input.text);
          } else {
            if (input.clearFirst) {
              await page.keyboard.press("Control+a");
              await page.keyboard.press("Delete");
            }
            await page.keyboard.type(input.text);
          }
          return `Wpisano: "${input.text}"`;
        } catch (e) {
          return `Błąd wpisywania: ${(e as Error).message}`;
        }
      },
    }),

    pressKey: tool({
      description: "Naciśnij klawisz (np. Enter, Escape, Tab, ArrowDown).",
      inputSchema: z.object({
        key: z.string().describe("Nazwa klawisza"),
      }),
      execute: async (input: { key: string }) => {
        await page.keyboard.press(input.key);
        await page.waitForLoadState("domcontentloaded");
        return `Naciśnięto: ${input.key}`;
      },
    }),

    addToCart: tool({
      description:
        "Dodaj pierwszy widoczny produkt do koszyka – kliknie przycisk '+' na pierwszej karcie produktu. Użyj po wyszukaniu produktu.",
      inputSchema: z.object({}),
      execute: async () => {
        const btn = page
          .locator('[data-test-id="ItemCardStepperIncrement"]')
          .first();
        if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await btn.click();
          return "Dodano do koszyka";
        }
        const fallback = page
          .locator('[aria-label="Dodaj jeszcze jedno"][role="button"]')
          .first();
        if (await fallback.isVisible({ timeout: 1000 }).catch(() => false)) {
          await fallback.click();
          return "Dodano do koszyka (aria fallback)";
        }
        return "Nie znaleziono przycisku dodawania do koszyka";
      },
    }),

    navigate: tool({
      description: "Przejdź do podanego URL.",
      inputSchema: z.object({
        url: z.string().describe("Pełny URL"),
      }),
      execute: async (input: { url: string }) => {
        await page.goto(input.url, {
          waitUntil: "domcontentloaded",
          timeout: 60_000,
        });
        return `Przeszedłem do: ${input.url}`;
      },
    }),

    scroll: tool({
      description: "Przewiń stronę.",
      inputSchema: z.object({
        direction: z.enum(["down", "up"]).default("down"),
        amount: z.number().default(500).describe("Liczba pikseli"),
      }),
      execute: async (input: { direction: "down" | "up"; amount: number }) => {
        await page.mouse.wheel(
          0,
          input.direction === "down" ? input.amount : -input.amount,
        );
        await page.waitForLoadState("domcontentloaded");
        return `Przewinięto ${input.direction} o ${input.amount}px`;
      },
    }),

    wait: tool({
      description:
        "Poczekaj chwilę (max 1s). Używaj RZADKO – zazwyczaj lepiej od razu zrobić screenshot zamiast czekać.",
      inputSchema: z.object({
        ms: z
          .number()
          .default(500)
          .describe("Czas oczekiwania w ms (max 1000)"),
      }),
      execute: async (input: { ms: number }) => {
        const capped = Math.min(input.ms, 1000);
        await new Promise((r) => setTimeout(r, capped));
        return `Czekano ${capped}ms`;
      },
    }),

    done: tool({
      description:
        "Zakończ gdy zadanie jest wykonane lub napotkasz nierozwiązywalny problem.",
      inputSchema: z.object({
        summary: z.string().describe("Podsumowanie co udało się zrobić"),
        success: z.boolean().describe("Czy zadanie się powiodło"),
      }),
      execute: async (input: { summary: string; success: boolean }) => input,
    }),
  };
}

const SYSTEM_PROMPT = `Jesteś agentem przeglądarki automatyzującym Wolt.
Zawsze zaczynaj od narzędzia screenshot żeby zobaczyć aktualny stan strony.
Podejmuj decyzje na podstawie tego co widzisz na screenshocie.
Viewport ma rozmiar 1400x900px – używaj współrzędnych w tych granicach.

WAŻNE WSKAZÓWKI:
- Narzędzie screenshot zwraca OBRAZ + LISTĘ klikalnych elementów z ich współrzędnymi [x,y]. ZAWSZE czytaj tę listę.
- Żeby kliknąć element, znajdź go na liście klikalnych elementów i użyj clickAt z jego współrzędnymi [x,y].
- Przycisk "+" do dodawania produktu do koszyka ma aria-label "Dodaj jeszcze jedno" lub podobny. Znajdź go NA LIŚCIE klikalnych elementów, weź jego [x,y] i kliknij clickAt.
- NIGDY nie klikaj w środek karty produktu – to otwiera popup. Zawsze celuj w przycisk "+" w prawym górnym rogu karty.
- Jeśli nie widzisz elementu na liście, użyj getHTML żeby zbadać DOM.`;

function buildUserPrompt(items: string[]) {
  return `Wykonaj następujące kroki na Wolt:

Strona Wolt jest już otwarta, adres dostawy ustawiony. Zrób screenshot żeby zobaczyć aktualny stan.

FAZA 1 – Wejdź w Auchan:
1. W polu wyszukiwania w headerze (lupa na górze) wpisz "Auchan"
2. Poczekaj na wyniki – pojawią się kafelki sklepów Auchan
3. Kliknij "Auchan Pokorna" z listy wyników
4. Poczekaj aż załaduje się strona sklepu Auchan

FAZA 2 – Dodaj produkty do koszyka:
Na stronie Auchana jest pole wyszukiwania "Szukaj w Auchan..." – używaj go do szukania produktów.
Dla KAŻDEGO produktu z listy:
  a) Kliknij w pole wyszukiwania "Szukaj w Auchan..." i wpisz nazwę produktu
  b) Poczekaj na wyniki i zrób screenshot
  c) Od razu użyj narzędzia addToCart – ono kliknie przycisk "+" na PIERWSZYM produkcie w wynikach. NIE scrolluj, NIE oceniaj czy produkt pasuje – wyszukiwarka Wolta zwraca najlepsze dopasowanie jako pierwszy wynik.
  d) Zrób screenshot żeby potwierdzić dodanie
  e) Przed szukaniem następnego produktu wyczyść pole wyszukiwania

Lista produktów do dodania:
${items.map((item, i) => `${i + 1}. ${item}`).join("\n")}

FAZA 3 – Zakończ:
5. Kliknij przycisk "Zobacz zamówienie" (div z tekstem "Zobacz zamówienie") – użyj click z method='text' i selector='Zobacz zamówienie'
6. Zrób finalny screenshot
7. Wywołaj done z podsumowaniem – wymień które produkty udało się dodać a które nie

WAŻNE: Po każdej akcji rób screenshot żeby zobaczyć efekt. NIE używaj wait – zamiast tego od razu rób screenshot, strona sama się załaduje.`;
}

export interface OrderResult {
  summary: string;
  success: boolean;
}

export async function orderGroceries(items: string[]): Promise<OrderResult> {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const model = google("gemini-3.1-flash-lite-preview");

  const browser = await chromium.launch({ headless: false, slowMo: 30 });
  const context = await browser.newContext({
    locale: "pl-PL",
    viewport: { width: 1400, height: 900 },
  });

  const cookiePath = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    "wolt-cookies.txt",
  );
  if (fs.existsSync(cookiePath)) {
    const raw = fs.readFileSync(cookiePath, "utf-8").trim();
    const cookies = raw.split("; ").map((pair) => {
      const eqIdx = pair.indexOf("=");
      return {
        name: pair.slice(0, eqIdx),
        value: pair.slice(eqIdx + 1),
        domain: ".wolt.com",
        path: "/",
      };
    });
    await context.addCookies(cookies);
  }

  const page = await context.newPage();
  console.log("[init] otwieranie wolt.com...");
  await page.goto("https://wolt.com/pl/pol", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  console.log("[init] strona załadowana, startuję agenta...");

  const tools = createBrowserTools(page);

  try {
    const result = await generateText({
      model,
      system: SYSTEM_PROMPT,
      prompt: buildUserPrompt(items),
      tools,
      stopWhen: [stepCountIs(80)],
      onStepFinish: (step) => {
        if (step.text) console.log(`[LLM] ${step.text.slice(0, 200)}`);
        for (const tr of step.toolResults) {
          if (tr.toolName !== "screenshot") {
            console.log(
              `[${tr.toolName}]`,
              JSON.stringify(tr.output).slice(0, 150),
            );
          } else {
            console.log("[screenshot] <obraz>");
          }
        }
      },
    });

    const doneStep = result.steps
      .flatMap((s) => s.toolResults)
      .find((tr) => tr.toolName === "done");

    if (doneStep) {
      return doneStep.output as OrderResult;
    }

    return { summary: "Agent zakończył bez wywołania done", success: false };
  } finally {
    await browser.close();
  }
}
