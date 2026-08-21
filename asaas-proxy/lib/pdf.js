import puppeteer from "puppeteer-core";

// No container de produção (Alpine) usamos o Chromium instalado via apk,
// nunca o binário que o puppeteer tentaria baixar sozinho (não roda em
// Alpine). Em dev, dá pra apontar PUPPETEER_EXECUTABLE_PATH pra qualquer
// Chrome/Chromium local.
const EXECUTABLE_PATH = process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium-browser";

const ESTILO = `
  body { font-family: Arial, Helvetica, sans-serif; font-size: 12pt; line-height: 1.5; color: #111; padding: 0 8mm; }
  p { margin: 0 0 10pt; text-align: justify; }
  strong { font-weight: bold; }
`;

// Converte um trecho de HTML (o contrato, possivelmente editado pela
// equipe) num PDF pronto pra assinatura.
export async function htmlParaPdf(html) {
  const browser = await puppeteer.launch({
    executablePath: EXECUTABLE_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${ESTILO}</style></head><body>${html}</body></html>`, {
      waitUntil: "load",
    });
    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: { top: "20mm", bottom: "20mm", left: "18mm", right: "18mm" },
      printBackground: true,
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}
