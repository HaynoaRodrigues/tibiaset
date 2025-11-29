const fs = require("fs");
const path = require("path");

const DIR = __dirname;

// ---------------- HELPERS ---------------- //

function looksLikeImage(text) {
  if (!text) return false;
  return /\.(gif|png|jpg|jpeg)$/i.test(text.trim());
}

function normalizeVocation(v) {
  if (!v || v.toLowerCase() === "todas") return ["all"];
  return v.replace(/and/gi, ",")
    .split(",")
    .map(x => x.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeBonus(str) {
  if (!str || str.toLowerCase().includes("nenhum")) return {};
  const obj = {};
  str.split(",").forEach(p => {
    const m = p.trim().match(/(.+?)\s*\+([+-]?\d+)/i);
    if (m) {
      obj[m[1].trim().toLowerCase().replace(/\s+/g, "_")] = Number(m[2]);
    }
  });
  return obj;
}

function normalizeProtection(str) {
  if (!str || str.toLowerCase().includes("nenhuma")) return {};
  const obj = {};
  str.split(",").forEach(p => {
    const m = p.trim().match(/(.+?)\s*([+-]?\d+)%/i);
    if (m) {
      obj[m[1].trim().toLowerCase().replace(/\s+/g, "_")] = Number(m[2]);
    }
  });
  return obj;
}

function normalizeElementalDamage(str) {
  if (!str || str.toLowerCase() === "none") return {};
  const obj = {};
  str.split(",").forEach(p => {
    const m = p.trim().match(/(.+?)\s*([+-]?\d+)%?/i);
    if (m) {
      obj[m[1].trim().toLowerCase().replace(/\s+/g, "_")] = Number(m[2]);
    }
  });
  return obj;
}

// ---------------- PARSERS POR CATEGORIA ---------------- //

function parseMeleeWeapon(parts, hasImage) {
  const base = hasImage ? 2 : 1;
  return {
    imageUrl: "",
    level: Number(parts[base]) || 0,
    vocation: normalizeVocation(parts[base + 1] || ""),
    hands: Number(parts[base + 2]) || 1,
    attack: Number(parts[base + 3]) || 0,
    elemental: normalizeElementalDamage(parts[base + 4] || ""),
    defense: Number(parts[base + 5]) || 0,
    defense_mod: Number(parts[base + 6]) || 0,
    bonus: normalizeBonus(parts[base + 7] || ""),
    slots: Number(parts[base + 8]) || 0,
    tier: Number(parts[base + 9]) || 0,
    weight: Number((parts[base + 10] || "").replace(",", ".")) || 0,
  };
}

function parseRodWand(parts, hasImage) {
  const base = hasImage ? 2 : 1;
  return {
    imageUrl: "",
    level: Number(parts[base]) || 0,
    vocation: normalizeVocation(parts[base + 1] || ""),
    damage_type: (parts[base + 2] || "").toLowerCase(),
    bonus: normalizeBonus(parts[base + 3] || ""),
    protection: normalizeProtection(parts[base + 4] || ""),
    avg_damage: Number(parts[base + 5]) || 0,
    mana_per_hit: Number(parts[base + 6]) || 0,
    slots: Number(parts[base + 7]) || 0,
    tier: Number(parts[base + 8]) || 0,
    weight: Number((parts[base + 9] || "").replace(",", ".")) || 0,
  };
}

function parseDistanceWeapon(parts, hasImage) {
  const base = hasImage ? 2 : 1;
  return {
    imageUrl: "",
    level: Number(parts[base]) || 0,
    vocation: normalizeVocation(parts[base + 1] || ""),
    hands: Number(parts[base + 2]) || 1,
    range: Number(parts[base + 3]) || 0,
    attack: Number(parts[base + 4]) || 0,
    hit: Number(parts[base + 5]) || 0,
    bonus: normalizeBonus(parts[base + 6] || ""),
    elemental: normalizeElementalDamage(parts[base + 7] || ""),
    protection: normalizeProtection(parts[base + 8] || ""),
    slots: Number(parts[base + 9]) || 0,
    tier: Number(parts[base + 10]) || 0,
    weight: Number((parts[base + 11] || "").replace(",", ".")) || 0,
  };
}

function parseAmmo(parts, hasImage) {
  const base = hasImage ? 2 : 1;
  return {
    imageUrl: "",
    level: Number(parts[base]) || 0,
    attack: Number(parts[base + 1]) || 0,
    elemental: normalizeElementalDamage(parts[base + 2] || ""),
    weight: Number((parts[base + 3] || "").replace(",", ".")) || 0
  };
}

function parseFists(parts, hasImage) {
  const base = hasImage ? 2 : 1;
  return {
    imageUrl: "",
    level: Number(parts[base]) || 0,
    vocation: normalizeVocation(parts[base + 1] || ""),
    hands: Number(parts[base + 2]) || 1,
    attack: Number(parts[base + 3]) || 0,
    elemental_bond: Number(parts[base + 4]) || 0,
    defense: Number(parts[base + 5]) || 0,
    defense_mod: Number(parts[base + 6]) || 0,
    bonus: normalizeBonus(parts[base + 7] || ""),
    slots: Number(parts[base + 8]) || 0,
    tier: Number(parts[base + 9]) || 0,
    weight: Number((parts[base + 10] || "").replace(",", ".")) || 0,
  };
}

// ---------------- PROCESSAMENTO AUTOMÁTICO ---------------- //

function getParserForFile(file) {
  const f = file.toLowerCase();
  if (f.includes("axe")) return parseMeleeWeapon;
  if (f.includes("club")) return parseMeleeWeapon;
  if (f.includes("sword")) return parseMeleeWeapon;
  if (f.includes("rod")) return parseRodWand;
  if (f.includes("wand")) return parseRodWand;
  if (f.includes("dist")) return parseDistanceWeapon;
  if (f.includes("fist") || f.includes("punho")) return parseFists;
  return null;
}

const files = fs.readdirSync(DIR).filter(f => f.endsWith(".txt"));

files.forEach(file => {
  const parser = getParserForFile(file);
  if (!parser) {
    console.log("Ignorado (tipo desconhecido):", file);
    return;
  }

  const txt = fs.readFileSync(path.join(DIR, file), "utf8");
  const lines = txt.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("Nome"));

  const out = lines.map(line => {
    const parts = line.split("\t").map(x => x.trim());
    const hasImage = looksLikeImage(parts[1]);
    return {
      name: parts[0],
      dados: parser(parts, hasImage),
      ativo: true
    };
  });

  const output = file.replace(".txt", ".json");
  fs.writeFileSync(path.join(DIR, output), JSON.stringify(out, null, 2));
  console.log("Gerado:", output, "(", out.length, "itens)");
});

console.log("\n✔ Todas as armas processadas!");
