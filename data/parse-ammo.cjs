const fs = require("fs");
const path = require("path");

const INPUT = path.join(__dirname, "ammo.txt");
const OUTPUT = path.join(__dirname, "ammo.json");

if (!fs.existsSync(INPUT)) {
  console.error("Erro: ammo.txt não encontrado em", INPUT);
  process.exit(1);
}

const raw = fs.readFileSync(INPUT, "utf8").replace(/\r/g, "");
const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);

// helpers
const isHeader = (l) => /nome/i.test(l) && /lvl/i.test(l);
const isImage = (s) => /\.(gif|png|jpe?g)$/i.test((s||"").trim());
const toNumber = (s) => {
  if (s === undefined || s === null) return 0;
  const n = Number(String(s).replace(",", ".").replace(/[^\d\.\-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

// tenta extrair "NN Physical" -> returns number or null
function extractPhysicalToken(token) {
  if (!token) return null;
  const m = token.match(/(\d+)\s*Physical/i);
  return m ? Number(m[1]) : null;
}

// tenta extrair "NN Type" (elem) -> [type, value] or null
function extractElementalToken(token) {
  if (!token) return null;
  const m = token.match(/(\d+)\s*([A-Za-z ]+)/);
  if (!m) return null;
  const type = m[2].trim().toLowerCase().replace(/\s+/g, "_");
  return { type, value: Number(m[1]) };
}

// detecta número decimal (peso)
function looksLikeWeight(token) {
  if (!token) return false;
  return /^\d+([.,]\d+)?$/.test(token.trim());
}

const items = [];
const skipped = [];
for (let i = 0; i < lines.length; i++) {
  const rawLine = lines[i];
  if (isHeader(rawLine)) continue;

  const parts = rawLine.split("\t").map(p => (p||"").trim());

  // mínimo razoável: name, lvl, atq, ... -> se short, tenta fallback com 2+ spaces
  if (parts.length < 4) {
    const alt = rawLine.split(/\s{2,}/).map(x => x.trim()).filter(Boolean);
    if (alt.length >= 4) {
      // replace parts
      for (let k=0;k<alt.length;k++) parts[k] = alt[k];
    }
  }

  // detect image column: if second column looks like .gif, ignore it (image present)
  let base = 0; // index of level is base+1 etc
  if (parts.length >= 2 && isImage(parts[1])) base = 1;

  // required indices according to base:
  // name = parts[0]
  // level = parts[1+base], attack = parts[2+base], then variable tokens start at idx = 3+base
  const name = parts[0] || "";
  const level = toNumber(parts[1 + base]);
  const attack = toNumber(parts[2 + base]);

  // build a tail array with tokens after attack (safely)
  const tail = parts.slice(3 + base);

  // we'll detect physical, elemental, weight, drop robustly
  let physical = 0;
  let elemental = {};
  let weight = 0;
  let drop = "";

  // Strategy:
  // 1) find first token in tail that matches "NN Physical" -> take it as physical
  // 2) if found, check next token for elemental "NN Type" -> if matches, take it
  // 3) after that, find first token that looks like weight (decimal) -> weight
  // 4) remaining tokens joined -> drop
  // 5) if no physical found but a token looks like weight soon after, treat as bolt (no physical/elemental)

  let physIndex = -1;
  for (let t = 0; t < tail.length; t++) {
    if (extractPhysicalToken(tail[t]) !== null) { physIndex = t; break; }
  }

  if (physIndex >= 0) {
    physical = extractPhysicalToken(tail[physIndex]) || 0;

    // try elemental at next position
    const elemCandidate = tail[physIndex + 1];
    const elem = extractElementalToken(elemCandidate);
    if (elem) {
      elemental[elem.type] = elem.value;
      // weight candidate after that
      // weight could be at physIndex+2 or later
      let weightIdx = -1;
      for (let w = physIndex + 2; w < tail.length; w++) {
        if (looksLikeWeight(tail[w])) { weightIdx = w; break; }
      }
      if (weightIdx >= 0) {
        weight = toNumber(tail[weightIdx]);
        drop = tail.slice(weightIdx + 1).join("\t").trim();
      } else {
        // maybe weight in physIndex+2 as number-with-decimal attached to elemental? handle fallback
        const fallback = tail[physIndex + 2];
        if (fallback && looksLikeWeight(fallback)) {
          weight = toNumber(fallback);
          drop = tail.slice(physIndex + 3).join("\t").trim();
        } else {
          // weight not found, put rest as drop
          drop = tail.slice(physIndex + 2).join("\t").trim();
        }
      }
    } else {
      // no elemental; look for weight after physIndex+1
      let weightIdx = -1;
      for (let w = physIndex + 1; w < tail.length; w++) {
        if (looksLikeWeight(tail[w])) { weightIdx = w; break; }
      }
      if (weightIdx >= 0) {
        weight = toNumber(tail[weightIdx]);
        drop = tail.slice(weightIdx + 1).join("\t").trim();
      } else {
        // weight not found -> rest is drop
        drop = tail.slice(physIndex + 1).join("\t").trim();
      }
    }
  } else {
    // no physical found -> likely a bolt format (name, lvl, atq, weight, drop)
    // try to find first token that looks like weight
    let weightIdx = -1;
    for (let t = 0; t < tail.length; t++) {
      if (looksLikeWeight(tail[t])) { weightIdx = t; break; }
    }
    if (weightIdx >= 0) {
      weight = toNumber(tail[weightIdx]);
      drop = tail.slice(weightIdx + 1).join("\t").trim();
    } else {
      // can't parse — push to skipped
      skipped.push({ lineNumber: i+1, rawLine, reason: "no physical or weight found" });
      continue;
    }
  }

  items.push({
    name,
    dados: {
      imageUrl: "",
      level,
      attack,
      physical_damage: physical,
      elemental_damage: elemental,
      weight,
      drop
    },
    ativo: true
  });
}

// write file
fs.writeFileSync(OUTPUT, JSON.stringify(items, null, 2), "utf8");

console.log("Processed:", items.length, "items");
if (skipped.length) {
  console.warn("Skipped", skipped.length, "lines. Example:", skipped.slice(0,3));
}
console.log("Output:", OUTPUT);
