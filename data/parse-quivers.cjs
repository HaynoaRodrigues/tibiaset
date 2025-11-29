const fs = require("fs");
const path = require("path");

const INPUT = path.join(__dirname, "quivers.txt");
const OUTPUT = path.join(__dirname, "quivers.json");

if (!fs.existsSync(INPUT)) {
  console.error("Arquivo quivers.txt não encontrado em", INPUT);
  process.exit(1);
}

const raw = fs.readFileSync(INPUT, "utf8");
const lines = raw.split("\n").map(l => l.replace(/\r/g, ""));

// ---------------- helpers ----------------
function clean(v) {
  if (v === undefined || v === null) return "";
  return String(v).trim().replace(/\s+/g, " ");
}
function stripDot(s) {
  return s.replace(/\.$/, "").trim();
}
function looksLikeImage(s) {
  if (!s) return false;
  return /\.(gif|png|jpe?g)$/i.test(s.trim());
}
function normalizeVocation(v) {
  const s = stripDot(clean(v)).toLowerCase();
  if (!s) return [];
  if (s.includes("todas")) return ["all"];
  return s.replace(/and/gi, ",").split(",").map(x => x.trim()).filter(Boolean);
}
function parseSkillBonus(raw) {
  raw = stripDot(clean(raw));
  if (!raw) return {};
  const low = raw.toLowerCase();
  if (low === "nenhum" || low === "-") return {};
  const out = {};
  raw.split(/[,;]+/).forEach(p => {
    const m = p.trim().match(/(.+?)\s*([+-]?\d+)$/);
    if (m) {
      const key = m[1].trim().toLowerCase().replace(/\s+/g, "_");
      out[key] = Number(m[2]);
    }
  });
  return out;
}
function parseProtection(raw) {
  raw = stripDot(clean(raw));
  if (!raw) return {};
  const low = raw.toLowerCase();
  if (low === "nenhuma" || low === "-" ) return {};
  const out = {};
  raw.split(/[,;]+/).forEach(p => {
    const m = p.trim().match(/(.+?)\s*([+-]?\d+)\s*%?/i);
    if (m) {
      const key = m[1].trim().toLowerCase().replace(/\s+/g, "_");
      out[key] = Number(m[2]);
    }
  });
  return out;
}

// ---------------- parse lines ----------------
const items = [];
// detect header at top
let startIndex = 0;
if (lines.length && /nome/i.test(lines[0])) startIndex = 1;

for (let i = startIndex; i < lines.length; i++) {
  const rawLine = lines[i];
  if (!rawLine || !rawLine.trim()) continue;
  const parts = rawLine.split("\t").map(p => p === undefined ? "" : p);

  // determine if there's an image column as 2nd column
  // valid shapes:
  // with image: [name, image, lvl, voc, volume, bonus, protection, weight, drop]
  // without image: [name, lvl, voc, volume, bonus, protection, weight, drop]
  let hasImage = false;
  if (parts.length >= 2 && looksLikeImage(parts[1])) hasImage = true;

  // compute indices
  const idx = (nameIndex = 0, imageIndex = hasImage ? 1 : -1,
               levelIndex = hasImage ? 2 : 1,
               vocationIndex = hasImage ? 3 : 2,
               volumeIndex = hasImage ? 4 : 3,
               bonusIndex = hasImage ? 5 : 4,
               protectionIndex = hasImage ? 6 : 5,
               weightIndex = hasImage ? 7 : 6,
               dropIndex = hasImage ? 8 : 7) && {
    name: 0,
    level: hasImage ? 2 : 1,
    vocation: hasImage ? 3 : 2,
    volume: hasImage ? 4 : 3,
    bonus: hasImage ? 5 : 4,
    protection: hasImage ? 6 : 5,
    weight: hasImage ? 7 : 6,
    drop: hasImage ? 8 : 7
  };

  // guard - if not enough columns, try to be tolerant
  const minNeeded = hasImage ? 8 : 7;
  if (parts.length < minNeeded) {
    // attempt fallback splitting by multiple spaces
    const alt = rawLine.split(/\s{2,}/).map(x => x.trim());
    if (alt.length >= minNeeded) {
      // replace parts with alt and recompute hasImage false
      const p2 = alt;
      parts.length = 0;
      Array.prototype.push.apply(parts, p2);
      hasImage = false;
      // recompute idx for no image
      Object.assign(idx, {
        level: 1, vocation: 2, volume: 3, bonus: 4, protection: 5, weight: 6, drop: 7
      });
    } else {
      // skip line if irreparably malformed
      console.warn("Linha ignorada (colunas insuficientes):", rawLine);
      continue;
    }
  }

  const name = stripDot(clean(parts[idx.name] || ""));
  const level = Number((parts[idx.level] || "").replace(",", ".")) || 0;
  const vocation = normalizeVocation(parts[idx.vocation] || "");
  const volume = Number((parts[idx.volume] || "").replace(",", ".")) || 0;
  const skill_bonus = parseSkillBonus(parts[idx.bonus] || "");
  const protection = parseProtection(parts[idx.protection] || "");
  const weight = Number((parts[idx.weight] || "").replace(",", ".")) || 0;
  // drop may contain tabs inside (rare) — join remaining fields
  let drop = "";
  if ((idx.drop) < parts.length) {
    drop = parts.slice(idx.drop).join("\t").trim();
  }

  items.push({
    name,
    dados: {
      imageUrl: "",        // conforme pedido, sempre vazio
      level,
      vocation,
      volume,
      skill_bonus,
      protection,
      weight,
      drop
    },
    ativo: true
  });
}

// write output
fs.writeFileSync(OUTPUT, JSON.stringify(items, null, 2), "utf8");
console.log("Gerado:", OUTPUT, "itens:", items.length);
