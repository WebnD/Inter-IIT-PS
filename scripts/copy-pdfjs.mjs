// Copies the pdf.js browser build into public/pdfjs so the viewer loads it as a plain
// ES module (bypassing webpack, which mangles pdf.js v4 during minification).
// Runs automatically on `npm install` (postinstall) and before `npm run build`.
import { copyFile, mkdir } from "node:fs/promises";

const from = new URL("../node_modules/pdfjs-dist/legacy/build/", import.meta.url);
const to = new URL("../public/pdfjs/", import.meta.url);
await mkdir(to, { recursive: true });
for (const f of ["pdf.min.mjs", "pdf.worker.min.mjs"]) {
  await copyFile(new URL(f, from), new URL(f, to));
}
console.log("pdf.js copied to public/pdfjs");
