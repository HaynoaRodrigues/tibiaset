const fs = require("fs");
const path = require("path");

const INPUT = path.join(__dirname, "amulet_necklace.txt");
const OUTPUT = path.join(__dirname, "amulet_necklace.json");

const raw = fs.readFileSync(INPUT, "utf8").replace(/\r/g, "");
const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);

const isHeader = (l) => /nome/i.test(l) && /lvl/i.test(l);

const isImage = (s) => /\.(gif|png|jpe?g)$/i.test((s || "").trim());

function toNumber(v) {
  if (!v) return 0;
  return Number(String(v).replace(",", ".").replace(/[^\d.]/g, "")) || 0;
}

function parseStats(text) {
  if (!text || text.toLowerCase().includes("nenhum")) return {};

  const obj = {};
  const parts = text.split(",").map(p => p.trim());

  for (const p of parts) {
    // Ex: Magic Level +2
    let m = p.match(/(.+?)\s*\+(\d+)/);
    if (m) {
      const key = m[1].trim().toLowerCase().replace(/\s+/g, "_");
      obj[key] = Number(m[2]);
      continue;
    }

    // Ex: Sword Fighting +3
    m = p.match(/(.+?)\s*\+(\d+)/i);
    if (m) {
      const key = m[1].trim().toLowerCase().replace(/\s+/g, "_");
      obj[key] = Number(m[2]);
    }
  }

  return obj;
}

function parseProtection(text) {
  if (!text || text.toLowerCase().includes("nenhuma")) return {};

  const obj = {};
  const parts = text.split(",").map(p => p.trim());

  for (const p of parts) {
    // Ex: Fire +10%
    const m = p.match(/(.+?)\s*\+(\d+)%/);
    if (m) {
      const key = m[1].trim().toLowerCase().replace(/\s+/g, "_");
      obj[key] = Number(m[2]);
    }
  }

  return obj;
}

function parseAttributes(text) {
  if (!text || text.toLowerCase().includes("nenhum")) return {};

  const obj = {};
  const parts = text.split(",").map(p => p.trim());

  for (const p of parts) {
    // Ex: Speed +30
    const m = p.match(/(.+?)\s*\+(\d+)/);
    if (m) {
      const key = m[1].trim().toLowerCase().replace(/\s+/g, "_");
      obj[key] = Number(m[2]);
    }
  }

  return obj;
}

const items = [];
for (let line of lines) {
  if (isHeader(line)) continue;

  const parts = line.split("\t").map(x => x.trim());

  let base = 0;
  if (isImage(parts[1])) base = 1;

  const name = parts[0];
  const level = toNumber(parts[1 + base]);
  const vocation = parts[2 + base];
  const armor = toNumber(parts[3 + base]);
  const charges = toNumber(parts[4 + base]);
  const duration = toNumber(parts[5 + base]);
  const attributes = parseAttributes(parts[6 + base]);
  const bonus = parseStats(parts[7 + base]);
  const protection = parseProtection(parts[8 + base]);
  const weight = toNumber(parts[9 + base]);
  const drop = parts.slice(10 + base).join(" ").trim();

  items.push({
    name,
    dados: {
      imageUrl: "",
      level,
      vocation,
      armor,
      charges,
      duration,
      attributes,
      bonus,
      protection,
      weight,
      drop
    },
    ativo: true
  });
}

fs.writeFileSync(OUTPUT, JSON.stringify(items, null, 2), "utf8");

console.log("Itens convertidos:", items.length);
console.log("Arquivo gerado:", OUTPUT);
