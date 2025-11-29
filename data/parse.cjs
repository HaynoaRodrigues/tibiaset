const fs = require("fs");
const path = require("path");

const DIR = __dirname;
const inputFiles = fs.readdirSync(DIR).filter(f => f.endsWith(".txt"));

/** normalizers **/
function normalizeVocation(v) {
  if (!v) return [];
  if (v.toLowerCase().includes("todas")) return ["all"];
  return v.replace(/and/gi, ",").split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
}
function normalizeBonus(str) {
  if (!str) return {};
  if (str.toLowerCase().includes("nenhum")) return {};
  const obj = {};
  str.split(",").forEach(p => {
    const m = p.trim().match(/(.+?)\s*\+(\d+)/i);
    if (m) obj[m[1].trim().toLowerCase().replace(/\s+/g, "_")] = Number(m[2]);
  });
  return obj;
}
function normalizeProtection(str) {
  if (!str) return {};
  if (str.toLowerCase().includes("nenhuma")) return {};
  const obj = {};
  str.split(",").forEach(p => {
    // captura nome e número com sinal opcional (+ ou -)
    const m = p.trim().match(/(.+?)\s*([+-]?\d+)%/i);
    if (m) {
      const key = m[1].trim().toLowerCase().replace(/\s+/g, "_");
      obj[key] = Number(m[2]);
    }
  });
  return obj;
}

/** helpers **/
function looksLikeImage(text) {
  if (!text) return false;
  return /\.(gif|png|jpg|jpeg)$/i.test(text.trim());
}

/** parsers with flexible offset (image or not) **/
function parseHelmetLike(parts) {
  // possible layouts:
  // A) name, image, level, vocation, armor, bonus, protection, slots, tier, weight, drop
  // B) name, level, vocation, armor, bonus, protection, slots, tier, weight, drop
  let idx = 1;
  let hasImage = looksLikeImage(parts[1]);
  if (hasImage) {
    // shift indices: image at 1, level at 2, vocation at 3...
    return {
      imageUrl: "",
      level: Number(parts[2]) || 0,
      vocation: normalizeVocation(parts[3] || ""),
      armor: Number((parts[4] || "").replace(",", ".")) || 0,
      bonus: normalizeBonus(parts[5] || ""),
      protection: normalizeProtection(parts[6] || ""),
      slots: Number(parts[7]) || 0,
      tier: Number(parts[8]) || 0,
      weight: Number((parts[9] || "").replace(",", ".")) || 0,
      drop: parts[10] || ""
    };
  } else {
    // no image column
    return {
      imageUrl: "",
      level: Number(parts[1]) || 0,
      vocation: normalizeVocation(parts[2] || ""),
      armor: Number((parts[3] || "").replace(",", ".")) || 0,
      bonus: normalizeBonus(parts[4] || ""),
      protection: normalizeProtection(parts[5] || ""),
      slots: Number(parts[6]) || 0,
      tier: Number(parts[7]) || 0,
      weight: Number((parts[8] || "").replace(",", ".")) || 0,
      drop: parts[9] || ""
    };
  }
}

function parseShieldFlexible(parts) {
  // name, image?, level, vocation, slots, def, skillbonus, protection, weight, drop
  let hasImage = looksLikeImage(parts[1]);
  if (hasImage) {
    return {
      imageUrl: "",
      level: Number(parts[2]) || 0,
      vocation: normalizeVocation(parts[3] || ""),
      slots: Number(parts[4]) || 0,
      defense: Number(parts[5]) || 0,
      skill_bonus: normalizeBonus(parts[6] || ""),
      protection: normalizeProtection(parts[7] || ""),
      weight: Number((parts[8] || "").replace(",", ".")) || 0,
      drop: parts[9] || ""
    };
  } else {
    return {
      imageUrl: "",
      level: Number(parts[1]) || 0,
      vocation: normalizeVocation(parts[2] || ""),
      slots: Number(parts[3]) || 0,
      defense: Number(parts[4]) || 0,
      skill_bonus: normalizeBonus(parts[5] || ""),
      protection: normalizeProtection(parts[6] || ""),
      weight: Number((parts[7] || "").replace(",", ".")) || 0,
      drop: parts[8] || ""
    };
  }
}

function parseSpellbookFlexible(parts) {
  let hasImage = looksLikeImage(parts[1]);
  if (hasImage) {
    return {
      imageUrl: "",
      level: Number(parts[2]) || 0,
      vocation: normalizeVocation(parts[3] || ""),
      defense: Number(parts[4]) || 0,
      bonus: normalizeBonus(parts[5] || ""),
      protection: normalizeProtection(parts[6] || ""),
      slots: Number(parts[7]) || 0,
      weight: Number((parts[8] || "").replace(",", ".")) || 0,
      drop: parts[9] || ""
    };
  } else {
    return {
      imageUrl: "",
      level: Number(parts[1]) || 0,
      vocation: normalizeVocation(parts[2] || ""),
      defense: Number(parts[3]) || 0,
      bonus: normalizeBonus(parts[4] || ""),
      protection: normalizeProtection(parts[5] || ""),
      slots: Number(parts[6]) || 0,
      weight: Number((parts[7] || "").replace(",", ".")) || 0,
      drop: parts[8] || ""
    };
  }
}

function parseQuiverFlexible(parts) {
  let hasImage = looksLikeImage(parts[1]);
  if (hasImage) {
    return {
      imageUrl: "",
      level: Number(parts[2]) || 0,
      vocation: normalizeVocation(parts[3] || ""),
      volume: Number(parts[4]) || 0,
      skill_bonus: normalizeBonus(parts[5] || ""),
      protection: normalizeProtection(parts[6] || ""),
      weight: Number((parts[7] || "").replace(",", ".")) || 0,
      drop: parts[8] || ""
    };
  } else {
    return {
      imageUrl: "",
      level: Number(parts[1]) || 0,
      vocation: normalizeVocation(parts[2] || ""),
      volume: Number(parts[3]) || 0,
      skill_bonus: normalizeBonus(parts[4] || ""),
      protection: normalizeProtection(parts[5] || ""),
      weight: Number((parts[6] || "").replace(",", ".")) || 0,
      drop: parts[7] || ""
    };
  }
}

function parseExtraFlexible(parts) {
  // extras likely: name, attributes, weight (image unlikely)
  // handle either with or without image
  if (looksLikeImage(parts[1])) {
    return {
      imageUrl: "",
      attributes: normalizeBonus(parts[2] || ""),
      weight: Number((parts[3] || "").replace(",", ".")) || 0
    };
  } else {
    return {
      imageUrl: "",
      attributes: normalizeBonus(parts[1] || ""),
      weight: Number((parts[2] || "").replace(",", ".")) || 0
    };
  }
}

/** main loop **/
inputFiles.forEach(file => {
  if (!file.endsWith(".txt")) return;
  const txt = fs.readFileSync(path.join(DIR, file), "utf8");
  const lines = txt.split("\n").map(l => l.trim()).filter(l => l && !/^Nome/i.test(l));

  // guess type by filename
  const fname = file.toLowerCase();
  let out = [];
  for (const line of lines) {
    const parts = line.split("\t").map(s => s.trim());
    if (fname.includes("helmet") || fname.includes("armor") || fname.includes("leg") || fname.includes("boot")) {
      out.push({ name: parts[0], dados: parseHelmetLike(parts), ativo: true });
    } else if (fname.includes("shield")) {
      out.push({ name: parts[0], dados: parseShieldFlexible(parts), ativo: true });
    } else if (fname.includes("spellbook")) {
      out.push({ name: parts[0], dados: parseSpellbookFlexible(parts), ativo: true });
    } else if (fname.includes("quiver") || fname.includes("aljava") || fname.includes("aljavas")) {
      out.push({ name: parts[0], dados: parseQuiverFlexible(parts), ativo: true });
    } else if (fname.includes("extra") || fname.includes("extras") || fname.includes("extra-slot")) {
      out.push({ name: parts[0], dados: parseExtraFlexible(parts), ativo: true });
    } else {
      // unknown, skip
      console.log("Ignorado (nome de arquivo não reconhecido):", file);
      break;
    }
  }

  const outFile = file.replace(".txt", ".json");
  fs.writeFileSync(path.join(DIR, outFile), JSON.stringify(out, null, 2), "utf8");
  console.log("Gerado", outFile, "(", out.length, "itens )");
});

console.log("Concluído.");
