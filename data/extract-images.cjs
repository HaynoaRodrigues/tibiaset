const fs = require("fs");
const path = require("path");

const INPUT = path.join(__dirname, "images.txt");
const OUTPUT = path.join(__dirname, "images.json");

const BASE_URL = "https://www.tibiawiki.com.br";

// Extrai src="" e transforma em URL completa
function extractImageUrls(text) {
  const regex = /src\s*=\s*["']([^"']+)["']/gi;
  const urls = [];

  let match;
  while ((match = regex.exec(text)) !== null) {
    let src = match[1];

    // remove querystrings
    src = src.split("?")[0].trim();

    // garante que começa com barra
    if (!src.startsWith("/")) src = "/" + src;

    urls.push(BASE_URL + src);
  }

  return urls;
}

// -------------------------------------------------------------------
// Processamento
// -------------------------------------------------------------------

if (!fs.existsSync(INPUT)) {
  console.error("❌ Erro: arquivo images.txt não encontrado!");
  process.exit(1);
}

const raw = fs.readFileSync(INPUT, "utf8");
const urls = extractImageUrls(raw);

// salva em JSON
fs.writeFileSync(OUTPUT, JSON.stringify(urls, null, 2), "utf8");

console.log("✔ Total de imagens encontradas:", urls.length);
console.log("✔ Gerado:", OUTPUT);
